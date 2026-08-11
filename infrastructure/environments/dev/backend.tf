resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_name}-${var.environment}-backend"
  retention_in_days = 14
}

data "aws_iam_policy_document" "ecs_tasks_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_execution" {
  name               = "${var.project_name}-${var.environment}-ecs-task-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "ecs_task_execution_secrets" {
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_db_instance.backend.master_user_secret[0].secret_arn]
  }
}

resource "aws_iam_role_policy" "ecs_task_execution_secrets" {
  name   = "${var.project_name}-${var.environment}-database-secret"
  role   = aws_iam_role.ecs_task_execution.id
  policy = data.aws_iam_policy_document.ecs_task_execution_secrets.json
}

resource "aws_iam_role" "ecs_task" {
  name               = "${var.project_name}-${var.environment}-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume_role.json
}

resource "aws_ecs_cluster" "backend" {
  name = "${var.project_name}-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_lb" "backend" {
  name               = "${var.project_name}-${var.environment}-backend"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = values(aws_subnet.public)[*].id

  enable_deletion_protection = false
}

resource "aws_lb_target_group" "backend" {
  name        = "${var.project_name}-${var.environment}-backend"
  port        = 8080
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  deregistration_delay = 30

  health_check {
    enabled             = true
    path                = "/api/health"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener" "backend" {
  load_balancer_arn = aws_lb.backend.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-${var.environment}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${aws_ecr_repository.backend.repository_url}:bootstrap"
      essential = true

      portMappings = [
        {
          name          = "http"
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
          appProtocol   = "http"
        },
      ]

      environment = [
        {
          name  = "SPRING_DATASOURCE_URL"
          value = "jdbc:postgresql://${aws_db_instance.backend.address}:${aws_db_instance.backend.port}/${aws_db_instance.backend.db_name}"
        },
        {
          name  = "SPRING_DATASOURCE_USERNAME"
          value = aws_db_instance.backend.username
        },
      ]

      secrets = [
        {
          name      = "SPRING_DATASOURCE_PASSWORD"
          valueFrom = "${aws_db_instance.backend.master_user_secret[0].secret_arn}:password::"
        },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.backend.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "backend"
        }
      }
    },
  ])
}

resource "aws_ecs_service" "backend" {
  name            = "backend"
  cluster         = aws_ecs_cluster.backend.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 0
  launch_type     = "FARGATE"

  health_check_grace_period_seconds = 120

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = values(aws_subnet.public)[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8080
  }

  depends_on = [
    aws_iam_role_policy_attachment.ecs_task_execution,
    aws_iam_role_policy.ecs_task_execution_secrets,
    aws_lb_listener.backend,
  ]

  lifecycle {
    ignore_changes = [
      desired_count,
      task_definition,
    ]
  }
}
