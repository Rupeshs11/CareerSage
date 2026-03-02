# ============================================
# CareerSage - Terraform Remote State (Optional)
# Uncomment below to store state in S3
# ============================================

# terraform {
#   backend "s3" {
#     bucket         = "careersage-terraform-state"
#     key            = "ec2/terraform.tfstate"
#     region         = "ap-south-1"
#     encrypt        = true
#     dynamodb_table = "terraform-locks"
#   }
# }
