#!/usr/bin/env python3
"""Run audit and apply fixes automatically."""
import json
from audit_application import ApplicationAuditor
from comprehensive_audit_fix import ComprehensiveAuditFixer


def run_audit() -> dict:
    auditor = ApplicationAuditor()
    auditor.audit_authentication_flow()
    auditor.audit_silent_failures()
    auditor.audit_code_quality()
    auditor.audit_api_consistency()
    report = auditor.generate_report()
    with open('auto_audit_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    return report


def run_fixes() -> dict:
    fixer = ComprehensiveAuditFixer()
    fixer.fix_missing_api_endpoints()
    fixer.fix_silent_failures_fetch_calls()
    fixer.fix_unsafe_session_access()
    fixer.add_missing_session_endpoints()
    fixer.fix_promise_without_catch()
    fixer.improve_error_handling_quality()
    fixer.create_authentication_recovery_system()
    return fixer.generate_comprehensive_report()


def main():
    audit_report = run_audit()
    fix_report = run_fixes()
    summary = {
        'audit_issues': audit_report['summary']['total_issues'],
        'fixes_applied': len(fix_report['fixes_applied'])
    }
    with open('auto_fix_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    print('Automation complete. Summary written to auto_fix_summary.json')


if __name__ == '__main__':
    main()
