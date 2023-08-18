# Kubernetes Deployment

```bash
# Deploy the service
$ kubectl apply -f chatgpt-lite-deployment.yaml -f env-secret.yaml
namespace/chatgpt-lite created
deployment.apps/chatgpt-lite created
service/chatgpt-lite created
secret/env created

# Get the service
$ kubectl -n chatgpt-lite get svc
NAME           TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)    AGE
chatgpt-lite   ClusterIP   10.0.199.26   <none>        3000/TCP   7m8s

# Use port-forward to access the service
$ kubectl -n chatgpt-lite port-forward svc/chatgpt-lite 5566:3000
Forwarding from 127.0.0.1:5566 -> 3000
Forwarding from [::1]:5566 -> 3000
```
