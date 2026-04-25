import boto3
from app.core.config import settings


class EC2Manager:
    def __init__(self):
        self._ec2 = boto3.client("ec2", region_name=settings.aws_region)

    def launch_inference_instance(
        self,
        ami_id: str,
        instance_type: str,
        user_data: str,
        security_group_ids: list[str],
        iam_instance_profile: str,
    ) -> str:
        response = self._ec2.run_instances(
            ImageId=ami_id,
            InstanceType=instance_type,
            MinCount=1,
            MaxCount=1,
            UserData=user_data,
            SecurityGroupIds=security_group_ids,
            IamInstanceProfile={"Name": iam_instance_profile},
            InstanceInitiatedShutdownBehavior="terminate",
            TagSpecifications=[
                {
                    "ResourceType": "instance",
                    "Tags": [
                        {"Key": "Project", "Value": "ecobrief"},
                        {"Key": "Role", "Value": "inference"},
                    ],
                }
            ],
        )
        instance_id = response["Instances"][0]["InstanceId"]
        return instance_id

    def wait_until_running(self, instance_id: str) -> None:
        waiter = self._ec2.get_waiter("instance_running")
        waiter.wait(InstanceIds=[instance_id])

    def terminate_instance(self, instance_id: str) -> None:
        self._ec2.terminate_instances(InstanceIds=[instance_id])

    def get_instance_public_ip(self, instance_id: str) -> str | None:
        response = self._ec2.describe_instances(InstanceIds=[instance_id])
        reservations = response.get("Reservations", [])
        if not reservations:
            return None
        instances = reservations[0].get("Instances", [])
        if not instances:
            return None
        return instances[0].get("PublicIpAddress")
