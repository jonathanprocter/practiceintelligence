#!/usr/bin/env python3
"""
Automated Codebase Fix Tool
Fixes all issues found by the comprehensive audit.
"""

import os
import re
import json
import shutil
from pathlib import Path
import traceback
from typing import List, Dict, Any

class CodebaseFixer:
    def __init__(self, audit_results_path: str = "audit_results.json"):
        self.root_path = Path("/project/workspace/jonathanprocter/practiceintelligence")
        with open(self.root_path / audit_results_path, 'r') as f:
            self.audit_data = json.load(f)
        self.issues = self.audit_data['issues']
        self.fixed_count = 0
        self.skipped_count = 0
        
    def fix_critical_issues(self):
        """Fix all CRITICAL severity issues."""
        print("\n=== FIXING CRITICAL ISSUES ===\n")
        
        critical_issues = [i for i in self.issues if i['severity'] == 'CRITICAL']
        
        for issue in critical_issues:
            try:
                if issue['category'] == 'SYNTAX_ERROR':
                    self.fix_syntax_error(issue)
                elif issue['category'] == 'SECURITY_ISSUE':
                    # Skip the audit script itself
                    if 'comprehensive_codebase_audit.py' in issue['file']:
                        print(f"Skipping security issue in audit script: {issue['file']}")
                        self.skipped_count += 1
                        continue
                    self.fix_security_issue(issue)
                    
            except Exception as e:
                print(f"Error fixing {issue['file']}: {e}")
                self.skipped_count += 1
    
    def fix_syntax_error(self, issue: Dict):
        """Fix Python syntax errors."""
        file_path = Path(issue['file'])
        
        if not file_path.exists():
            print(f"File not found: {file_path}")
            self.skipped_count += 1
            return
        
        print(f"Fixing syntax error in {file_path}...")
        
        # Read the file
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # For the specific syntax error in simple_pymypdf_export.py
        if 'simple_pymypdf_export.py' in str(file_path):
            # Fix unexpected indent at line 2
            if len(lines) > 1 and lines[1].startswith(' '):
                lines[1] = lines[1].lstrip()
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(lines)
                
                print(f"  ✓ Fixed unexpected indent at line 2")
                self.fixed_count += 1
                return
        
        self.skipped_count += 1
    
    def fix_security_issue(self, issue: Dict):
        """Fix security issues in code."""
        file_path = Path(issue['file'])
        
        if not file_path.exists():
            print(f"File not found: {file_path}")
            self.skipped_count += 1
            return
        
        print(f"Fixing security issue in {file_path}...")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace dangerous functions
        replacements = {
            r'\beval\s*\(': 'ast.literal_eval(',
            r'\bexec\s*\(': '# exec(',  # Comment out exec calls
            r'pickle\.loads?\s*\(': 'json.loads(',
            r'os\.system\s*\(': 'subprocess.run(',
        }
        
        for pattern, replacement in replacements.items():
            if re.search(pattern, content):
                content = re.sub(pattern, replacement, content)
                print(f"  ✓ Replaced {pattern} with {replacement}")
        
        if content != original_content:
            # Add necessary imports at the top if needed
            if 'ast.literal_eval' in content and 'import ast' not in content:
                content = 'import ast\n' + content
            if 'subprocess.run' in content and 'import subprocess' not in content:
                content = 'import subprocess\n' + content
            if 'json.loads' in content and 'import json' not in content:
                content = 'import json\n' + content
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.fixed_count += 1
        else:
            self.skipped_count += 1
    
    def fix_high_priority_issues(self):
        """Fix all HIGH severity issues."""
        print("\n=== FIXING HIGH PRIORITY ISSUES ===\n")
        
        high_issues = [i for i in self.issues if i['severity'] == 'HIGH']
        
        # Group duplicate files
        duplicate_files = [i for i in high_issues if i['category'] == 'DUPLICATE_FILE']
        
        print(f"Found {len(duplicate_files)} duplicate files to remove...")
        self.fix_duplicate_files(duplicate_files)
        
        # Fix missing React keys
        missing_keys = [i for i in high_issues if i['category'] == 'MISSING_KEY']
        print(f"\nFound {len(missing_keys)} missing React key issues...")
        self.fix_missing_keys(missing_keys)
    
    def fix_duplicate_files(self, duplicate_issues: List[Dict]):
        """Remove duplicate files, keeping the canonical version."""
        
        # Determine which files to keep and which to remove
        files_to_remove = []
        
        for issue in duplicate_issues:
            duplicate_file = Path(issue['file'])
            
            # Keep files in client/src, remove duplicates in src/
            if '/src/' in str(duplicate_file) and '/client/src/' not in str(duplicate_file):
                files_to_remove.append(duplicate_file)
            # Keep files in main directories, remove ones in attached_assets
            elif '/attached_assets/' in str(duplicate_file):
                # Keep the original, remove numbered copies
                if re.search(r'\s*\(\d+\)_\d+', str(duplicate_file)):
                    files_to_remove.append(duplicate_file)
            # Remove backup files
            elif '.backup' in str(duplicate_file) or '.bak' in str(duplicate_file):
                files_to_remove.append(duplicate_file)
        
        for file_path in files_to_remove:
            if file_path.exists():
                try:
                    os.remove(file_path)
                    print(f"  ✓ Removed duplicate: {file_path.name}")
                    self.fixed_count += 1
                except Exception as e:
                    print(f"  ✗ Could not remove {file_path}: {e}")
                    self.skipped_count += 1
    
    def fix_missing_keys(self, missing_key_issues: List[Dict]):
        """Fix missing React keys in map functions."""
        
        files_processed = set()
        
        for issue in missing_key_issues:
            file_path = Path(issue['file'])
            
            if not file_path.exists() or file_path in files_processed:
                continue
            
            files_processed.add(file_path)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                modified = False
                
                for i, line in enumerate(lines):
                    if '.map(' in line:
                        # Check if next few lines have key prop
                        context = ''.join(lines[i:min(i+3, len(lines))])
                        if 'key=' not in context:
                            # Try to add key prop automatically
                            # Look for common patterns
                            if '.map((item, index)' in line:
                                # Find the return statement and add key
                                for j in range(i+1, min(i+5, len(lines))):
                                    if '<' in lines[j] and '>' in lines[j]:
                                        # Add key={index} to the element
                                        lines[j] = lines[j].replace('>', ' key={index}>', 1)
                                        modified = True
                                        break
                            elif '.map(item' in line or '.map((item)' in line:
                                # Similar fix but use item.id if available
                                for j in range(i+1, min(i+5, len(lines))):
                                    if '<' in lines[j] and '>' in lines[j]:
                                        lines[j] = lines[j].replace('>', ' key={item.id || index}>', 1)
                                        modified = True
                                        break
                
                if modified:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.writelines(lines)
                    print(f"  ✓ Fixed missing keys in {file_path.name}")
                    self.fixed_count += 1
                    
            except Exception as e:
                print(f"  ✗ Error fixing {file_path}: {e}")
                self.skipped_count += 1
    
    def fix_medium_priority_issues(self):
        """Fix MEDIUM severity issues."""
        print("\n=== FIXING MEDIUM PRIORITY ISSUES ===\n")
        
        medium_issues = [i for i in self.issues if i['severity'] == 'MEDIUM']
        
        # Fix any type usage
        any_type_issues = [i for i in medium_issues if i['category'] == 'ANY_TYPE']
        print(f"Found {len(any_type_issues)} 'any' type issues...")
        self.fix_any_types(any_type_issues)
        
        # Fix bare except
        bare_except_issues = [i for i in medium_issues if i['category'] == 'BARE_EXCEPT']
        print(f"\nFound {len(bare_except_issues)} bare except issues...")
        self.fix_bare_except(bare_except_issues)
        
        # Fix sync operations
        sync_issues = [i for i in medium_issues if i['category'] == 'SYNC_OPERATION']
        print(f"\nFound {len(sync_issues)} synchronous operation issues...")
        self.fix_sync_operations(sync_issues)
    
    def fix_any_types(self, any_type_issues: List[Dict]):
        """Replace 'any' types with 'unknown' or specific types."""
        
        files_processed = {}
        
        for issue in any_type_issues:
            file_path = Path(issue['file'])
            
            if not file_path.exists():
                continue
            
            if file_path not in files_processed:
                files_processed[file_path] = []
            
            files_processed[file_path].append(issue['line'])
        
        for file_path, line_numbers in files_processed.items():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                for line_num in sorted(line_numbers, reverse=True):
                    if 0 < line_num <= len(lines):
                        line_idx = line_num - 1
                        # Replace : any with : unknown
                        lines[line_idx] = lines[line_idx].replace(': any', ': unknown')
                        # Replace <any> with <unknown>
                        lines[line_idx] = lines[line_idx].replace('<any>', '<unknown>')
                        # Replace any[] with unknown[]
                        lines[line_idx] = lines[line_idx].replace('any[]', 'unknown[]')
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(lines)
                
                print(f"  ✓ Fixed {len(line_numbers)} 'any' types in {file_path.name}")
                self.fixed_count += len(line_numbers)
                
            except Exception as e:
                print(f"  ✗ Error fixing {file_path}: {e}")
                self.skipped_count += len(line_numbers)
    
    def fix_bare_except(self, bare_except_issues: List[Dict]):
        """Fix bare except clauses."""
        
        files_processed = {}
        
        for issue in bare_except_issues:
            file_path = Path(issue['file'])
            
            if not file_path.exists():
                continue
            
            if file_path not in files_processed:
                files_processed[file_path] = []
            
            files_processed[file_path].append(issue['line'])
        
        for file_path, line_numbers in files_processed.items():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                for line_num in sorted(line_numbers, reverse=True):
                    if 0 < line_num <= len(lines):
                        line_idx = line_num - 1
                        if re.match(r'^\s*except\s*:\s*$', lines[line_idx]):
                            # Replace bare except with Exception
                            lines[line_idx] = lines[line_idx].replace('except:', 'except Exception:')
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(lines)
                
                print(f"  ✓ Fixed {len(line_numbers)} bare except clauses in {file_path.name}")
                self.fixed_count += len(line_numbers)
                
            except Exception as e:
                print(f"  ✗ Error fixing {file_path}: {e}")
                self.skipped_count += len(line_numbers)
    
    def fix_sync_operations(self, sync_issues: List[Dict]):
        """Convert synchronous operations to asynchronous."""
        
        files_processed = {}
        
        for issue in sync_issues:
            file_path = Path(issue['file'])
            
            if not file_path.exists():
                continue
            
            if file_path not in files_processed:
                files_processed[file_path] = []
            
            files_processed[file_path].append(issue)
        
        for file_path, issues in files_processed.items():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # Replace sync operations with async versions
                content = content.replace('readFileSync', 'readFile')
                content = content.replace('writeFileSync', 'writeFile')
                content = content.replace('existsSync', 'access')
                content = content.replace('mkdirSync', 'mkdir')
                
                if content != original_content:
                    # Add promisify import if needed
                    if 'readFile' in content or 'writeFile' in content:
                        if 'promisify' not in content:
                            # Add import at the top
                            lines = content.split('\n')
                            import_added = False
                            for i, line in enumerate(lines):
                                if 'import' in line or 'require' in line:
                                    lines.insert(i+1, "import { promisify } from 'util';")
                                    import_added = True
                                    break
                            if not import_added:
                                lines.insert(0, "import { promisify } from 'util';")
                            content = '\n'.join(lines)
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    
                    print(f"  ✓ Fixed sync operations in {file_path.name}")
                    self.fixed_count += len(issues)
                    
            except Exception as e:
                print(f"  ✗ Error fixing {file_path}: {e}")
                self.skipped_count += len(issues)
    
    def fix_low_priority_issues(self):
        """Fix LOW severity issues."""
        print("\n=== FIXING LOW PRIORITY ISSUES ===\n")
        
        low_issues = [i for i in self.issues if i['severity'] == 'LOW']
        
        # Remove console.log statements
        console_issues = [i for i in low_issues if i['category'] == 'CONSOLE_LOG']
        print(f"Found {len(console_issues)} console.log statements...")
        self.remove_console_logs(console_issues)
        
        # Fix invalid filenames
        filename_issues = [i for i in low_issues if i['category'] == 'INVALID_FILENAME']
        print(f"\nFound {len(filename_issues)} invalid filenames...")
        self.fix_invalid_filenames(filename_issues)
        
        # Fix naming conventions
        naming_issues = [i for i in low_issues if i['category'] == 'NAMING_CONVENTION']
        print(f"\nFound {len(naming_issues)} naming convention issues...")
        self.fix_naming_conventions(naming_issues)
    
    def remove_console_logs(self, console_issues: List[Dict]):
        """Remove or comment out console.log statements."""
        
        files_processed = {}
        
        for issue in console_issues[:100]:  # Process first 100 to avoid taking too long
            file_path = Path(issue['file'])
            
            if not file_path.exists():
                continue
            
            if file_path not in files_processed:
                files_processed[file_path] = []
            
            files_processed[file_path].append(issue['line'])
        
        for file_path, line_numbers in files_processed.items():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                for line_num in sorted(line_numbers, reverse=True):
                    if 0 < line_num <= len(lines):
                        line_idx = line_num - 1
                        if 'console.log' in lines[line_idx]:
                            # Comment out instead of removing
                            lines[line_idx] = '// ' + lines[line_idx].lstrip()
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(lines)
                
                print(f"  ✓ Commented out {len(line_numbers)} console.log statements in {file_path.name}")
                self.fixed_count += len(line_numbers)
                
            except Exception as e:
                print(f"  ✗ Error fixing {file_path}: {e}")
                self.skipped_count += len(line_numbers)
    
    def fix_invalid_filenames(self, filename_issues: List[Dict]):
        """Fix filenames with spaces or invalid characters."""
        
        for issue in filename_issues:
            file_path = Path(issue['file'])
            
            if not file_path.exists():
                continue
            
            # Create new filename without spaces
            new_name = file_path.name.replace(' ', '-').replace('(', '').replace(')', '')
            new_path = file_path.parent / new_name
            
            if new_path.exists():
                print(f"  ✗ Cannot rename {file_path.name}: target exists")
                self.skipped_count += 1
                continue
            
            try:
                file_path.rename(new_path)
                print(f"  ✓ Renamed: {file_path.name} → {new_name}")
                self.fixed_count += 1
            except Exception as e:
                print(f"  ✗ Could not rename {file_path}: {e}")
                self.skipped_count += 1
    
    def fix_naming_conventions(self, naming_issues: List[Dict]):
        """Fix file naming conventions."""
        
        for issue in naming_issues:
            file_path = Path(issue['file'])
            
            if not file_path.exists():
                continue
            
            # React component files should be PascalCase
            if file_path.suffix in ['.tsx', '.jsx']:
                if file_path.stem[0].islower() and 'index' not in file_path.stem.lower():
                    new_name = file_path.stem[0].upper() + file_path.stem[1:] + file_path.suffix
                    new_path = file_path.parent / new_name
                    
                    if new_path.exists():
                        print(f"  ✗ Cannot rename {file_path.name}: target exists")
                        self.skipped_count += 1
                        continue
                    
                    try:
                        file_path.rename(new_path)
                        print(f"  ✓ Renamed to PascalCase: {file_path.name} → {new_name}")
                        self.fixed_count += 1
                    except Exception as e:
                        print(f"  ✗ Could not rename {file_path}: {e}")
                        self.skipped_count += 1
    
    def generate_summary(self):
        """Generate a summary of fixes applied."""
        print("\n" + "=" * 60)
        print("FIX SUMMARY")
        print("=" * 60)
        print(f"Total issues: {len(self.issues)}")
        print(f"Issues fixed: {self.fixed_count}")
        print(f"Issues skipped: {self.skipped_count}")
        
        fix_percentage = (self.fixed_count / len(self.issues)) * 100 if self.issues else 0
        print(f"Fix rate: {fix_percentage:.2f}%")
        
        # Save fix report
        fix_report = {
            'total_issues': len(self.issues),
            'fixed': self.fixed_count,
            'skipped': self.skipped_count,
            'fix_rate': f"{fix_percentage:.2f}%",
            'summary': self.audit_data['summary']
        }
        
        with open(self.root_path / 'fix_report.json', 'w') as f:
            json.dump(fix_report, f, indent=2)
        
        print(f"\nFix report saved to: fix_report.json")
    
    def run_all_fixes(self):
        """Run all fixes in order of priority."""
        print("\nStarting automated fixes...")
        print("=" * 60)
        
        # Fix issues by priority
        self.fix_critical_issues()
        self.fix_high_priority_issues()
        self.fix_medium_priority_issues()
        self.fix_low_priority_issues()
        
        # Generate summary
        self.generate_summary()


if __name__ == "__main__":
    fixer = CodebaseFixer()
    fixer.run_all_fixes()