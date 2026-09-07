# Issues

The following issues were identified after testing in production. Resolve them one at a time, not
all at once - they may be worked out of order, and combined or split into phases as appropriate, but
each fix is its own commit & push, verified & tested and deployed individually before moving to the
next.

For each issue: before making any change, write a test that reproduces it and confirm the test fails
(red) for the right reason - never write or fix code first and add the test after the fact. Only once
red is confirmed, resolve the issue; then run that same test again and confirm it passes (green).
Document the resolution inline after each issue, including confirmation that the reproducing test
went red before the fix and green after, verify & test the changes, commit & push, & verify the
deployment succeeds. Include the documented resolution in this file in that same commit.
