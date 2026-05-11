# Task completion checklist
- Confirm `npm install` completed before running Nx tasks.
- Prefer `npx nx <target> <project>` or `npx nx run-many -t <target>` for validation.
- For the shop app, verify `npx nx serve shop` also brings up the API via the `dependsOn` configuration.
- When a task is done, run the matching lint/test/build target if relevant.