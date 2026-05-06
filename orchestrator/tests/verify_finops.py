import boto3

def verify_finops_constraints():
    print("verifying finops scale-to-zero constraints...")
    ec2 = boto3.client('ec2')
    
    try:
        response = ec2.describe_instances(
            Filters=[{'Name': 'tag:Project', 'Values': ['EcoBrief']}]
        )
    except Exception as e:
        print("ensure aws credentials are set in environment.")
        return
    
    instances_found = False
    for reservation in response['Reservations']:
        for instance in reservation['Instances']:
            instances_found = True
            instance_id = instance['InstanceId']
            state = instance['State']['Name']
            instance_type = instance['InstanceType']
            
            print(f"instance: {instance_id}")
            print(f"type: {instance_type}")
            print(f"state: {state}")
            
            if state not in ['terminated', 'shutting-down']:
                print("WARNING: instance is active! scale-to-zero may have failed.")
            else:
                print("SUCCESS: scale-to-zero verified.")
                
            if 'LaunchTime' in instance:
                print(f"launched at: {instance['LaunchTime']}")
                
            print("---")
            
    if not instances_found:
        print("no ecobrief instances found in recent history.")

if __name__ == "__main__":
    verify_finops_constraints()
