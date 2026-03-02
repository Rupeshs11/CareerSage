# ============================================
# CareerSage - Terraform Variables
# ============================================

variable "aws_region" {
  description = "AWS region to deploy in"
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance (Amazon Linux 2023)"
  type        = string
  default     = "ami-0e35ddab05955cf57"  # Amazon Linux 2023 in ap-south-1 (update if needed)
}

variable "key_name" {
  description = "Name of the existing AWS key pair for SSH access"
  type        = string
}

variable "instance_name" {
  description = "Name tag for the EC2 instance"
  type        = string
  default     = "careersage-server"
}
