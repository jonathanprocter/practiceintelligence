#!/usr/bin/env python3
"""
Comprehensive Codebase Audit Tool
Analyzes the entire codebase for inconsistencies, errors, and improvements.
"""

import os
import re
import json
import ast
import subprocess
import hashlib
from pathlib import Path
from typing import Dict, List, Tuple, Any, Set
from collections import defaultdict, Counter
import traceback

class CodebaseAuditor:
    def __init__(self, root_path: str = "/project/workspace/jonathanprocter/practiceintelligence"):
        self.root_path = Path(root_path)
        self.issues = []
        self.file_hashes = {}
        self.duplicate_code = defaultdict(list)
        self.import_graph = defaultdict(set)
        self.unused_files = set()
        self.statistics = defaultdict(int)
        
        # Severity levels for prioritization
        self.severity_levels = {
            'CRITICAL': 1,  # Breaking errors, security issues
            'HIGH': 2,      # Type errors, missing dependencies
            'MEDIUM': 3,    # Code quality, performance issues
            'LOW': 4,       # Style issues, optimizations
            'INFO': 5       # Suggestions, best practices
        }

    def add_issue(self, severity: str, category: str, file_path: str, 
                  line: int, message: str, fix: str = None):
        """Add an issue to the issues list."""
        self.issues.append({
            'severity': severity,
            'category': category,
            'file': str(file_path),
            'line': line,
            'message': message,
            'fix': fix,
            'priority': self.severity_levels.get(severity, 5)
        })
        self.statistics[f"{severity}_{category}"] += 1

    def audit_python_files(self):
        """Audit all Python files for syntax and quality issues."""
        print("Auditing Python files...")
        for py_file in self.root_path.rglob("*.py"):
            if 'node_modules' in str(py_file) or '__pycache__' in str(py_file):
                continue
            
            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check syntax
                try:
                    tree = ast.parse(content)
                    self.analyze_python_ast(tree, py_file)
                except SyntaxError as e:
                    self.add_issue(
                        'CRITICAL', 'SYNTAX_ERROR', py_file, e.lineno or 0,
                        f"Python syntax error: {e.msg}",
                        "Fix the syntax error in the Python code"
                    )
                
                # Check for common issues
                self.check_python_imports(content, py_file)
                self.check_python_security(content, py_file)
                self.check_python_patterns(content, py_file)
                
            except Exception as e:
                self.add_issue(
                    'HIGH', 'FILE_ERROR', py_file, 0,
                    f"Error reading file: {str(e)}",
                    "Ensure file is accessible and properly encoded"
                )

    def analyze_python_ast(self, tree: ast.AST, file_path: Path):
        """Analyze Python AST for code quality issues."""
        class ASTAnalyzer(ast.NodeVisitor):
            def __init__(self, auditor, file_path):
                self.auditor = auditor
                self.file_path = file_path
                self.defined_names = set()
                self.used_names = set()

            def visit_FunctionDef(self, node):
                # Check for duplicate function names
                if node.name in self.defined_names:
                    self.auditor.add_issue(
                        'HIGH', 'DUPLICATE_FUNCTION', self.file_path, node.lineno,
                        f"Duplicate function definition: {node.name}",
                        f"Rename one of the duplicate '{node.name}' functions"
                    )
                self.defined_names.add(node.name)
                
                # Check for too many parameters
                if len(node.args.args) > 7:
                    self.auditor.add_issue(
                        'MEDIUM', 'COMPLEX_FUNCTION', self.file_path, node.lineno,
                        f"Function {node.name} has too many parameters ({len(node.args.args)})",
                        "Consider using configuration objects or breaking down the function"
                    )
                
                self.generic_visit(node)

            def visit_Name(self, node):
                if isinstance(node.ctx, ast.Load):
                    self.used_names.add(node.id)
                self.generic_visit(node)

        analyzer = ASTAnalyzer(self, file_path)
        analyzer.visit(tree)

    def check_python_imports(self, content: str, file_path: Path):
        """Check Python imports for issues."""
        lines = content.split('\n')
        imported_modules = set()
        
        for i, line in enumerate(lines, 1):
            if line.strip().startswith('import ') or line.strip().startswith('from '):
                # Check for duplicate imports
                module = line.strip().split()[1].split('.')[0]
                if module in imported_modules:
                    self.add_issue(
                        'LOW', 'DUPLICATE_IMPORT', file_path, i,
                        f"Duplicate import of module: {module}",
                        f"Remove duplicate import of '{module}'"
                    )
                imported_modules.add(module)
                
                # Check for star imports
                if '* ' in line:
                    self.add_issue(
                        'MEDIUM', 'STAR_IMPORT', file_path, i,
                        "Avoid using star imports (from module import *)",
                        "Import specific items instead of using *"
                    )

    def check_python_security(self, content: str, file_path: Path):
        """Check for security issues in Python code."""
        security_patterns = [
            (r'eval\s*\(', 'Use of eval() is dangerous', 'Replace eval() with ast.literal_eval() or safer alternatives'),
            (r'exec\s*\(', 'Use of exec() is dangerous', 'Avoid exec() or ensure input is properly sanitized'),
            (r'pickle\.loads?\s*\(', 'Pickle can execute arbitrary code', 'Use JSON or other safe serialization formats'),
            (r'os\.system\s*\(', 'os.system is vulnerable to injection', 'Use subprocess.run() with proper arguments'),
        ]
        
        lines = content.split('\n')
        for i, line in enumerate(lines, 1):
            for pattern, message, fix in security_patterns:
                if re.search(pattern, line):
                    self.add_issue(
                        'CRITICAL', 'SECURITY_ISSUE', file_path, i,
                        message, fix
                    )

    def check_python_patterns(self, content: str, file_path: Path):
        """Check for common Python anti-patterns."""
        lines = content.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Check for mutable default arguments
            if re.search(r'def\s+\w+\s*\([^)]*=\s*(\[\]|\{\})', line):
                self.add_issue(
                    'HIGH', 'MUTABLE_DEFAULT', file_path, i,
                    "Mutable default argument detected",
                    "Use None as default and create new object in function body"
                )
            
            # Check for bare except
            if re.match(r'^\s*except\s*:\s*$', line):
                self.add_issue(
                    'MEDIUM', 'BARE_EXCEPT', file_path, i,
                    "Bare except clause catches all exceptions",
                    "Specify exception types to catch"
                )

    def audit_typescript_files(self):
        """Audit TypeScript/JavaScript files."""
        print("Auditing TypeScript/JavaScript files...")
        
        for ext in ['*.ts', '*.tsx', '*.js', '*.jsx']:
            for ts_file in self.root_path.rglob(ext):
                if 'node_modules' in str(ts_file) or 'dist' in str(ts_file):
                    continue
                
                try:
                    with open(ts_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    self.check_typescript_issues(content, ts_file)
                    self.check_imports_exports(content, ts_file)
                    self.check_react_issues(content, ts_file)
                    
                except Exception as e:
                    self.add_issue(
                        'HIGH', 'FILE_ERROR', ts_file, 0,
                        f"Error reading file: {str(e)}",
                        "Ensure file is accessible and properly encoded"
                    )

    def check_typescript_issues(self, content: str, file_path: Path):
        """Check for TypeScript-specific issues."""
        lines = content.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Check for any type
            if re.search(r':\s*any\b', line):
                self.add_issue(
                    'MEDIUM', 'ANY_TYPE', file_path, i,
                    "Usage of 'any' type defeats TypeScript's type safety",
                    "Replace 'any' with specific type or 'unknown'"
                )
            
            # Check for console.log
            if 'console.log' in line and not 'eslint-disable' in line:
                self.add_issue(
                    'LOW', 'CONSOLE_LOG', file_path, i,
                    "console.log found in production code",
                    "Remove console.log or use proper logging library"
                )
            
            # Check for TODO/FIXME comments
            if 'TODO' in line or 'FIXME' in line:
                self.add_issue(
                    'INFO', 'TODO_COMMENT', file_path, i,
                    f"Unresolved TODO/FIXME: {line.strip()}",
                    "Address the TODO/FIXME comment"
                )

    def check_imports_exports(self, content: str, file_path: Path):
        """Check for import/export issues in TypeScript."""
        lines = content.split('\n')
        imported_items = set()
        
        for i, line in enumerate(lines, 1):
            # Check for duplicate imports
            import_match = re.search(r'import\s+(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+[\'"]([^\'"]+)', line)
            if import_match:
                module = import_match.group(1)
                if module in imported_items:
                    self.add_issue(
                        'LOW', 'DUPLICATE_IMPORT', file_path, i,
                        f"Duplicate import from module: {module}",
                        f"Combine imports from '{module}'"
                    )
                imported_items.add(module)
                
                # Track import relationships
                self.import_graph[str(file_path)].add(module)
            
            # Check for missing file extensions in relative imports
            if re.search(r'from\s+[\'"]\.\.?/[^\'".]+[\'"]', line):
                if not any(ext in line for ext in ['.js', '.ts', '.tsx', '.jsx', '.json', '.css']):
                    self.add_issue(
                        'LOW', 'IMPORT_EXTENSION', file_path, i,
                        "Relative import missing file extension",
                        "Add appropriate file extension to import"
                    )

    def check_react_issues(self, content: str, file_path: Path):
        """Check for React-specific issues."""
        if not ('.tsx' in str(file_path) or '.jsx' in str(file_path)):
            return
        
        lines = content.split('\n')
        
        # Check for missing keys in map
        for i, line in enumerate(lines, 1):
            if '.map(' in line and 'key=' not in ''.join(lines[i-1:i+3]):
                self.add_issue(
                    'HIGH', 'MISSING_KEY', file_path, i,
                    "React list items missing key prop",
                    "Add unique key prop to list items"
                )
            
            # Check for direct state mutation
            if 'this.state.' in line and '=' in line and '==' not in line:
                self.add_issue(
                    'CRITICAL', 'STATE_MUTATION', file_path, i,
                    "Direct state mutation detected",
                    "Use setState() or state update functions"
                )

    def find_duplicate_code(self):
        """Find duplicate code blocks across files."""
        print("Finding duplicate code...")
        
        file_contents = {}
        for ext in ['*.ts', '*.tsx', '*.js', '*.jsx', '*.py']:
            for file_path in self.root_path.rglob(ext):
                if 'node_modules' in str(file_path) or 'dist' in str(file_path):
                    continue
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Hash file content
                    file_hash = hashlib.md5(content.encode()).hexdigest()
                    
                    if file_hash in self.file_hashes:
                        self.add_issue(
                            'HIGH', 'DUPLICATE_FILE', file_path, 0,
                            f"Entire file is duplicate of {self.file_hashes[file_hash]}",
                            "Remove duplicate file or consolidate code"
                        )
                    else:
                        self.file_hashes[file_hash] = str(file_path)
                    
                    # Check for duplicate functions
                    self.check_duplicate_functions(content, file_path)
                    
                except Exception:
                    pass

    def check_duplicate_functions(self, content: str, file_path: Path):
        """Check for duplicate function definitions."""
        # Extract function signatures
        function_patterns = [
            r'function\s+(\w+)\s*\(',
            r'const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=]+)\s*=>',
            r'def\s+(\w+)\s*\(',
            r'class\s+(\w+)\s*[({]',
        ]
        
        for pattern in function_patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                func_name = match.group(1)
                func_key = f"{func_name}_{pattern[:5]}"
                
                if func_key in self.duplicate_code:
                    for other_file in self.duplicate_code[func_key]:
                        if other_file != str(file_path):
                            self.add_issue(
                                'MEDIUM', 'DUPLICATE_FUNCTION', file_path, 0,
                                f"Function '{func_name}' also defined in {other_file}",
                                "Consider extracting to shared utility module"
                            )
                            break
                
                self.duplicate_code[func_key].append(str(file_path))

    def check_dependencies(self):
        """Check package.json dependencies for issues."""
        print("Checking dependencies...")
        
        package_files = list(self.root_path.glob("**/package.json"))
        for package_file in package_files:
            if 'node_modules' in str(package_file):
                continue
            
            try:
                with open(package_file, 'r') as f:
                    package_data = json.load(f)
                
                deps = package_data.get('dependencies', {})
                dev_deps = package_data.get('devDependencies', {})
                
                # Check for duplicate dependencies
                for dep in deps:
                    if dep in dev_deps:
                        self.add_issue(
                            'MEDIUM', 'DUPLICATE_DEPENDENCY', package_file, 0,
                            f"Package '{dep}' exists in both dependencies and devDependencies",
                            f"Remove '{dep}' from either dependencies or devDependencies"
                        )
                
                # Check for security issues in known vulnerable packages
                vulnerable_packages = {
                    'lodash': '< 4.17.21',
                    'axios': '< 0.21.2',
                    'minimist': '< 1.2.6',
                }
                
                all_deps = {**deps, **dev_deps}
                for pkg, safe_version in vulnerable_packages.items():
                    if pkg in all_deps:
                        self.add_issue(
                            'CRITICAL', 'VULNERABLE_DEPENDENCY', package_file, 0,
                            f"Package '{pkg}' may have known vulnerabilities",
                            f"Update '{pkg}' to version {safe_version} or higher"
                        )
                
            except Exception as e:
                self.add_issue(
                    'HIGH', 'INVALID_JSON', package_file, 0,
                    f"Invalid package.json: {str(e)}",
                    "Fix JSON syntax in package.json"
                )

    def check_unused_files(self):
        """Find potentially unused files."""
        print("Checking for unused files...")
        
        # Collect all files
        all_files = set()
        for ext in ['*.ts', '*.tsx', '*.js', '*.jsx', '*.py', '*.css', '*.scss']:
            for file_path in self.root_path.rglob(ext):
                if 'node_modules' not in str(file_path) and 'dist' not in str(file_path):
                    all_files.add(str(file_path.relative_to(self.root_path)))
        
        # Files that are imported/used
        used_files = set()
        for importing_file, imports in self.import_graph.items():
            for imported in imports:
                used_files.add(imported)
        
        # Entry points that shouldn't be marked as unused
        entry_points = [
            'index.ts', 'index.tsx', 'index.js', 'main.ts', 'main.tsx',
            'App.tsx', 'App.ts', 'server.ts', 'server.js'
        ]
        
        for file_path in all_files:
            is_entry = any(entry in str(file_path) for entry in entry_points)
            is_test = 'test' in str(file_path).lower() or 'spec' in str(file_path).lower()
            
            if not is_entry and not is_test and file_path not in used_files:
                full_path = self.root_path / file_path
                if full_path.exists():
                    self.add_issue(
                        'LOW', 'UNUSED_FILE', full_path, 0,
                        "File appears to be unused",
                        "Remove file if unused or add proper imports"
                    )

    def check_env_configuration(self):
        """Check environment configuration issues."""
        print("Checking environment configuration...")
        
        # Check for .env files
        env_files = list(self.root_path.glob("**/.env*"))
        for env_file in env_files:
            if '.example' not in str(env_file) and '.sample' not in str(env_file):
                self.add_issue(
                    'CRITICAL', 'ENV_FILE_COMMITTED', env_file, 0,
                    "Environment file should not be committed to repository",
                    "Add .env files to .gitignore and use .env.example instead"
                )
        
        # Check for hardcoded secrets
        for ext in ['*.ts', '*.tsx', '*.js', '*.jsx', '*.py']:
            for file_path in self.root_path.rglob(ext):
                if 'node_modules' in str(file_path) or 'dist' in str(file_path):
                    continue
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Check for potential secrets
                    secret_patterns = [
                        (r'api[_-]?key\s*=\s*["\'][a-zA-Z0-9]{20,}', 'API key'),
                        (r'secret\s*=\s*["\'][a-zA-Z0-9]{20,}', 'Secret'),
                        (r'password\s*=\s*["\'][^"\']+["\']', 'Password'),
                        (r'token\s*=\s*["\'][a-zA-Z0-9]{20,}', 'Token'),
                    ]
                    
                    for pattern, secret_type in secret_patterns:
                        matches = re.finditer(pattern, content, re.IGNORECASE)
                        for match in matches:
                            line_num = content[:match.start()].count('\n') + 1
                            self.add_issue(
                                'CRITICAL', 'HARDCODED_SECRET', file_path, line_num,
                                f"Possible hardcoded {secret_type} found",
                                f"Move {secret_type} to environment variables"
                            )
                
                except Exception:
                    pass

    def check_naming_conventions(self):
        """Check for naming convention inconsistencies."""
        print("Checking naming conventions...")
        
        # Check file naming
        for file_path in self.root_path.rglob("*"):
            if file_path.is_file() and 'node_modules' not in str(file_path):
                file_name = file_path.stem
                
                # Check for inconsistent file naming
                if file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
                    # React components should be PascalCase
                    if file_path.suffix in ['.tsx', '.jsx']:
                        if file_name[0].islower() and 'index' not in file_name.lower():
                            self.add_issue(
                                'LOW', 'NAMING_CONVENTION', file_path, 0,
                                "React component file should use PascalCase",
                                f"Rename file to {file_name[0].upper() + file_name[1:]}"
                            )
                
                # Check for spaces in filenames
                if ' ' in file_name:
                    self.add_issue(
                        'MEDIUM', 'INVALID_FILENAME', file_path, 0,
                        "File name contains spaces",
                        "Replace spaces with hyphens or underscores"
                    )

    def check_performance_issues(self):
        """Check for performance-related issues."""
        print("Checking performance issues...")
        
        for ext in ['*.ts', '*.tsx', '*.js', '*.jsx']:
            for file_path in self.root_path.rglob(ext):
                if 'node_modules' in str(file_path) or 'dist' in str(file_path):
                    continue
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    lines = content.split('\n')
                    
                    for i, line in enumerate(lines, 1):
                        # Check for synchronous file operations in Node.js
                        if 'readFileSync' in line or 'writeFileSync' in line:
                            self.add_issue(
                                'MEDIUM', 'SYNC_OPERATION', file_path, i,
                                "Synchronous file operation can block event loop",
                                "Use async file operations (readFile/writeFile with promises)"
                            )
                        
                        # Check for large inline arrays/objects
                        if len(line) > 500 and ('[' in line or '{' in line):
                            self.add_issue(
                                'LOW', 'LARGE_INLINE_DATA', file_path, i,
                                "Large inline data structure",
                                "Move large data to separate file or database"
                            )
                        
                        # Check for nested loops
                        if '.map(' in line and '.forEach(' in line:
                            self.add_issue(
                                'MEDIUM', 'NESTED_ITERATION', file_path, i,
                                "Nested array iterations can be inefficient",
                                "Consider using more efficient algorithms or data structures"
                            )
                
                except Exception:
                    pass

    def run_full_audit(self):
        """Run the complete audit."""
        print("Starting comprehensive codebase audit...")
        print("=" * 60)
        
        # Run all audit checks
        self.audit_python_files()
        self.audit_typescript_files()
        self.find_duplicate_code()
        self.check_dependencies()
        self.check_unused_files()
        self.check_env_configuration()
        self.check_naming_conventions()
        self.check_performance_issues()
        
        # Sort issues by priority
        self.issues.sort(key=lambda x: (x['priority'], x['category'], x['file']))
        
        # Generate report
        self.generate_report()

    def generate_report(self):
        """Generate the final audit report."""
        print("\n" + "=" * 60)
        print("CODEBASE AUDIT REPORT")
        print("=" * 60)
        
        # Summary statistics
        severity_counts = Counter(issue['severity'] for issue in self.issues)
        category_counts = Counter(issue['category'] for issue in self.issues)
        
        print("\nSUMMARY:")
        print(f"Total issues found: {len(self.issues)}")
        print("\nBy Severity:")
        for severity in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']:
            count = severity_counts.get(severity, 0)
            if count > 0:
                print(f"  {severity}: {count}")
        
        print("\nBy Category:")
        for category, count in sorted(category_counts.items()):
            print(f"  {category}: {count}")
        
        # Detailed issues with fixes
        print("\n" + "=" * 60)
        print("DETAILED ISSUES AND FIXES (Ordered by Priority)")
        print("=" * 60)
        
        current_severity = None
        for issue in self.issues:
            if issue['severity'] != current_severity:
                current_severity = issue['severity']
                print(f"\n--- {current_severity} PRIORITY ISSUES ---")
            
            print(f"\n[{issue['severity']}] {issue['category']}")
            print(f"File: {issue['file']}")
            if issue['line'] > 0:
                print(f"Line: {issue['line']}")
            print(f"Issue: {issue['message']}")
            if issue['fix']:
                print(f"Fix: {issue['fix']}")
        
        # Save JSON report
        report_path = self.root_path / "audit_results.json"
        with open(report_path, 'w') as f:
            json.dump({
                'summary': {
                    'total_issues': len(self.issues),
                    'by_severity': dict(severity_counts),
                    'by_category': dict(category_counts)
                },
                'issues': self.issues
            }, f, indent=2)
        
        print(f"\n\nFull report saved to: {report_path}")
        print("\nReady to apply fixes. The issues are sorted by criticality.")
        print("Starting with CRITICAL issues first, then HIGH, MEDIUM, LOW, and INFO.")

if __name__ == "__main__":
    auditor = CodebaseAuditor()
    auditor.run_full_audit()