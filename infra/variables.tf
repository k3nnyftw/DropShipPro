variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Name of the application"
  type        = string
  default     = "dropshipping"
}

variable "environment" {
  description = "Deployment environment (e.g., dev, staging, prod)"
  type        = string
  default     = "prod"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "azs" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "private_subnets" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnets" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

# Database Configuration
variable "postgres_engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "14.6"
}

variable "postgres_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.small"
}

variable "postgres_allocated_storage" {
  description = "Allocated storage for RDS instance (in GB)"
  type        = number
  default     = 20
}

variable "postgres_max_allocated_storage" {
  description = "Maximum allocated storage for RDS instance (in GB)"
  type        = number
  default     = 100
}

variable "postgres_backup_retention_period" {
  description = "Backup retention period for RDS instance (in days)"
  type        = number
  default     = 7
}

variable "postgres_username" {
  description = "Master username for RDS instance"
  type        = string
  default     = "postgres"
  sensitive   = true
}

# Redis Configuration
variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.small"
}

variable "redis_engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "6.2"
}

# Application Configuration
variable "container_port" {
  description = "Port that the container listens on"
  type        = number
  default     = 5000
}

variable "app_min_capacity" {
  description = "Minimum number of tasks for the service"
  type        = number
  default     = 2
}

variable "app_max_capacity" {
  description = "Maximum number of tasks for the service"
  type        = number
  default     = 10
}

variable "app_cpu" {
  description = "CPU units for the task"
  type        = number
  default     = 256
}

variable "app_memory" {
  description = "Memory for the task (in MiB)"
  type        = number
  default     = 512
}

# CloudFront Configuration
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS"
  type        = string
  default     = ""
}

# Monitoring Configuration
variable "alert_email" {
  description = "Email address for alerts"
  type        = string
  default     = ""
}