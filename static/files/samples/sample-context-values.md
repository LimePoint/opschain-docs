```yaml
---
change:
  id: 3a97c789-8f4e-497c-a1aa-04efaa2e87e7
  created_by: mary
  name: deploy
  action: deploy
  build_without_cache: false
  initial_step_tree: {}
  metadata:
    custom:
      change: metadata
  scheduled: false
  approved_by: []
  rejected_by: []
  cancelled_by:
  state_timing:
    running:
      ended_at:
      started_at: '2026-05-18T08:28:38.634814Z'
  state_timing_summary: {}
  notify: {}
  status_code: running
  mintmodel_change: false
  created_at: '2020-05-20T10:00:00.000000Z'
  started_at: '2020-05-20T10:00:05.000000Z'
  finished_at:
  updated_at: '2026-05-18T08:28:38.905832Z'
  asset_name:
  environment_name: Receivables
  project_name: Finance
  git_remote_name: origin
  git_rev: bug-fix
  commit_sha: 5213c76dad01ac0d87c2c900d46778675d4dc760
  requires_approval_from:
step:
  id: 37fdf12f-aff3-4134-8926-a2321cef5acf
  approved_by: []
  rejected_by: []
  continued_by: []
  requires_approval_from:
  action: deploy
  change_id: 3a97c789-8f4e-497c-a1aa-04efaa2e87e7
  child_execution_strategy: sequential
  full_path: deploy
  ignore_failure: false
  input_arguments: {}
  skip_on_retry: false
  state_timing:
    running:
      ended_at:
      started_at: '2026-05-18T08:28:38.634814Z'
  step_sequence: 1
  step_type: standard
  name: deploy
  created_at: '2020-05-20T10:00:00.000000Z'
  started_at: '2020-05-20T10:00:05.000000Z'
  finished_at:
  updated_at: '2026-05-18T08:28:38.905832Z'
  status_code: running
user:
  name: mary
  groups:
  - manager
  - purchasing
parent_order:
- project
- environment
- change
parents:
  project:
    id: bb7bef85-805f-43d9-a267-7e901630ffa0
    code: fin
    name: Finance
    description: Finance applications
    archived: false
    created_by: benedict
    project_type: Standard
  environment:
    id: 530d796b-60ff-4bc6-ad09-ac3eaf1afa45
    code: rcv
    name: Receivables
    description: RMS
    archived: false
    created_by: shayne.ortiz
```
