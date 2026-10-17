# gstack & MISSION IMPOSSIBLE Configuration for Antigravity & AI Agents

This workspace is integrated with the official Garry Tan `gstack` toolkit (v1.91.93.0) installed on this system at `C:\Users\yuvak\.claude\skills\gstack`.

## PERMANENT TRIGGER REQUIREMENT: MISSION IMPOSSIBLE

Whenever the user inputs:
```text
MISSION IMPOSSIBLE
```
(case-insensitively, e.g., `MISSION IMPOSSIBLE`, `mission impossible`, `Mission Impossible`), you must recognize this as the predefined development workflow trigger and execute the configured 10-step gstack workflow.

### Trigger Rules:
1. Treat this phrase as a command to initiate the 10-step mission workflow.
2. Do NOT treat it as casual conversation, a suggestion, or a request for explanation.
3. If the phrase appears inside quotations, ordinary discussion, or code blocks, do not trigger automatically unless explicitly invoked as a command.

---

## The 10-Step Mission Impossible Execution Lifecycle

When `MISSION IMPOSSIBLE` is triggered, follow these sequential steps:

1. **STEP 1 — UNDERSTAND THE MISSION:**
   - Ascertain the target repository, project objective, scope, acceptance criteria, and operational constraints.
   - Inspect the codebase before making assumptions. Ask clarifying questions only if the objective is ambiguous.

2. **STEP 2 — PRODUCT & REQUIREMENTS REVIEW (gstack: `/office-hours`, `/plan-ceo-review`):**
   - Challenge framing, evaluate 10-star product potential, test assumptions, lock scope.
   - Formulate clear acceptance criteria and edge cases.

3. **STEP 3 — ARCHITECTURE REVIEW (gstack: `/plan-eng-review`):**
   - Inspect system architecture, data flows, database schemas, auth boundaries, error handling, performance.
   - Avoid architectural drift unless changes are strictly necessary.

4. **STEP 4 — DESIGN REVIEW (gstack: `/plan-design-review`, `/design-review`):**
   - If UI is involved: audit responsiveness, accessibility, design consistency, loading & error states.
   - Protect established design systems and visual standards.

5. **STEP 5 — IMPLEMENTATION:**
   - Adhere strictly to the gstack reuse ladder:
     1. Helper/util in repo -> 2. Standard library -> 3. Native platform -> 4. Existing dependency.
   - Write complete, robust production code. Never use stubs, dummy functions, or mock placeholders.

6. **STEP 6 — CODE REVIEW (gstack: `/review`, `/deslop-shared-libs`):**
   - Scrutinize for functional bugs, regressions, race conditions, memory leaks, and security holes.
   - Automatically fix confirmed defects within mission scope.

7. **STEP 7 — REAL QA & TESTING (gstack: `/qa`, `/browse`):**
   - Run available unit, integration, and build tests (`npm test`, `npx tsc --noEmit`, etc.).
   - For web/browser flows, use the installed gstack headless browser binary:
     `C:\Users\yuvak\.claude\skills\gstack\browse\dist\browse.exe`
   - Execute real clicks, navigation, and visual verification. Never fabricate passes.

8. **STEP 8 — SECURITY & DATA INTEGRITY (gstack: `/cso`):**
   - Verify authentication, authorization, secret management, input sanitization, API protections.
   - Confirm zero secrets, keys, or sensitive credentials are committed.

9. **STEP 9 — FINAL VERIFICATION:**
   - Inspect `git diff`, confirm zero broken tests, verify clean build output, ensure clean workspace.

10. **STEP 10 — FINAL REPORT:**
    - Produce a structured mission report detailing:
      - MISSION
      - IMPLEMENTATION
      - FILES CHANGED
      - GSTACK WORKFLOWS
      - TESTS EXECUTED
      - TEST RESULTS
      - SECURITY REVIEW
      - KNOWN LIMITATIONS
      - FINAL STATUS: `PASS`, `PARTIAL`, or `FAIL`.

---

## Installed gstack Binaries and Tools
- **Gstack Repository Root:** `C:\Users\yuvak\.claude\skills\gstack`
- **Headless Browser CLI:** `C:\Users\yuvak\.claude\skills\gstack\browse\dist\browse.exe`
- **PDF Generation Utility:** `C:\Users\yuvak\.claude\skills\gstack\make-pdf\dist\pdf.exe`
- **Design Review Engine:** `C:\Users\yuvak\.claude\skills\gstack\design\dist\design.exe`
- **Diagnostic Tool:** `C:\Users\yuvak\.claude\skills\gstack\bin\gstack-doctor`
- **Bun Runtime:** `C:\Users\yuvak\.bun\bin\bun.exe`
