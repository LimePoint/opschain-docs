```yaml
---
project:
  id: bb7bef85-805f-43d9-a267-7e901630ffa0
  code: fin
  name: Finance
  description: Finance applications
  archived: false
environment:
  id: 530d796b-60ff-4bc6-ad09-ac3eaf1afa45
  code: rcv
  name: Receivables
  description: RMS
  archived: false
change:
  id: 3a97c789-8f4e-497c-a1aa-04efaa2e87e7
  created_by: mary
  created_at: '2020-05-20T10:00:00.000Z'
  action: deploy
  status_code: running
  started_at: '2020-05-20T10:00:05.000Z'
  finished_at:
  initial_step_tree:
  metadata:
    custom:
      change: metadata
  automated: false
  environment_name: Receivables
  project_name: Finance
  git_remote_name: origin
  git_rev: bug-fix
  commit_sha: 5213c76dad01ac0d87c2c900d46778675d4dc760
step:
  id: 37fdf12f-aff3-4134-8926-a2321cef5acf
  status_code: running
  action: deploy
  created_at: '2020-05-20T10:00:00.000Z'
  started_at: '2020-05-20T10:00:05.000Z'
  finished_at:
  step_type: standard
  approvers: []
  child_execution_strategy: sequential
user:
  name: mary
  groups:
  - manager
  - purchasing
```
