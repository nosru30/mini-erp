resource "aws_db_subnet_group" "backend" {
  name       = "${var.project_name}-${var.environment}"
  subnet_ids = values(aws_subnet.database)[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}"
  }
}

resource "aws_db_instance" "backend" {
  identifier = "${var.project_name}-${var.environment}"

  engine         = "postgres"
  instance_class = "db.t4g.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name                     = "mini_erp"
  username                    = "mini_erp"
  manage_master_user_password = true
  port                        = 5432

  db_subnet_group_name   = aws_db_subnet_group.backend.name
  vpc_security_group_ids = [aws_security_group.database.id]
  publicly_accessible    = false
  multi_az               = false

  backup_retention_period = 1
  copy_tags_to_snapshot   = true
  deletion_protection     = false
  skip_final_snapshot     = true
  apply_immediately       = true

  auto_minor_version_upgrade = true
}
