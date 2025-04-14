terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  
  backend "s3" {
    key = "dropshipping-automation/terraform.tfstate"
  }
}

provider "aws" {
  region = var.region
}

# Networking
module "vpc" {
  source = "./modules/vpc"
  
  app_name        = var.app_name
  environment     = var.environment
  vpc_cidr        = var.vpc_cidr
  azs             = var.azs
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets
}

# Database
module "database" {
  source = "./modules/database"
  
  app_name          = var.app_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  postgres_engine_version = var.postgres_engine_version
  postgres_instance_class = var.postgres_instance_class
  postgres_allocated_storage = var.postgres_allocated_storage
  postgres_max_allocated_storage = var.postgres_max_allocated_storage
  postgres_backup_retention_period = var.postgres_backup_retention_period
  postgres_username = var.postgres_username
}

# Redis
module "redis" {
  source = "./modules/redis"
  
  app_name         = var.app_name
  environment      = var.environment
  vpc_id           = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  redis_node_type  = var.redis_node_type
  redis_engine_version = var.redis_engine_version
}

# Container Registry
module "ecr" {
  source = "./modules/ecr"
  
  app_name    = var.app_name
  environment = var.environment
  repository_names = ["api", "frontend"]
}

# ECS cluster
module "ecs" {
  source = "./modules/ecs"
  
  app_name         = var.app_name
  environment      = var.environment
  vpc_id           = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
  ecr_repository_url = module.ecr.repository_url
  container_port    = var.container_port
  
  database_endpoint = module.database.endpoint
  database_name     = module.database.name
  database_username = var.postgres_username
  database_password = module.database.password
  
  redis_endpoint    = module.redis.endpoint
  
  min_capacity      = var.app_min_capacity
  max_capacity      = var.app_max_capacity
  cpu               = var.app_cpu
  memory            = var.app_memory
  health_check_path = "/api/health"
}

# CloudFront for frontend
module "cloudfront" {
  source = "./modules/cloudfront"
  
  app_name         = var.app_name
  environment      = var.environment
  alb_dns_name     = module.ecs.alb_dns_name
  domain_name      = var.domain_name
  certificate_arn  = var.certificate_arn
}

# CloudWatch alarms and monitoring
module "monitoring" {
  source = "./modules/monitoring"
  
  app_name         = var.app_name
  environment      = var.environment
  alb_arn          = module.ecs.alb_arn
  cluster_name     = module.ecs.cluster_name
  service_name     = module.ecs.service_name
  db_identifier    = module.database.identifier
  email_alerts     = var.alert_email
}

# WAF for security
module "waf" {
  source = "./modules/waf"
  
  app_name        = var.app_name
  environment     = var.environment
  alb_arn         = module.ecs.alb_arn
  cloudfront_distribution_id = module.cloudfront.distribution_id
}