#!/usr/bin/env python3
"""Generate BROWSER.html with deduplicated components grouped by type."""

import json
import os
from collections import defaultdict
from pathlib import Path

# Read the index
INDEX_PATH = Path("/home/z/my-project/download/reusable_components/_INDEX.json")
OUTPUT_PATH = Path("/home/z/my-project/download/reusable_components/BROWSER.html")

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    all_components = json.load(f)

# Filter out node_modules and test files
filtered = []
for comp in all_components:
    path = comp.get('path', '').lower()
    name = comp.get('name', '')
    
    # Skip node_modules
    if 'node_modules' in path:
        continue
    
    # Skip test files
    if '__tests__' in path or '__test__' in path:
        continue
    if name.startswith('Test') or name.endswith('Test'):
        continue
    
    # Keep only useful categories (skip generic ones)
    category = comp.get('category', '')
    skip_categories = ['__tests__', 'src', 'pages', 'react', 'contexts', 
                       'core', 'DayPicker', 'Focus', 'Modifiers', 'Navigation',
                       'SelectMultiple', 'SelectRange', 'SelectSingle']
    
    if category in skip_categories:
        continue
    
    filtered.append(comp)

# Global deduplication by name (keep first occurrence with most lines)
name_to_components = defaultdict(list)
for comp in filtered:
    name_to_components[comp['name']].append(comp)

# For each name, keep the one with most lines
unique_components = []
for name, comps in name_to_components.items():
    # Sort by lines descending, keep first
    best = max(comps, key=lambda c: c.get('lines', 0))
    unique_components.append(best)

# Group by category (type)
type_groups = defaultdict(list)
for comp in unique_components:
    cat = comp.get('category', 'other')
    type_groups[cat].append(comp)

# Sort groups by name
for cat in type_groups:
    type_groups[cat].sort(key=lambda c: c['name'].lower())

# Sort categories
sorted_categories = sorted(type_groups.keys())

# Generate HTML
total = len(unique_components)
total_projects = len(set(c['project'] for c in unique_components))

html = f'''<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Browser - {total} компонентов из {total_projects} проектов</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0f;
            color: #e5e5e5;
            min-height: 100vh;
        }}
        
        .header {{
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 20px;
            border-bottom: 1px solid #333;
            position: sticky;
            top: 0;
            z-index: 100;
        }}
        
        .header h1 {{
            font-size: 24px;
            margin-bottom: 10px;
            background: linear-gradient(90deg, #00d4ff, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        
        .stats {{
            display: flex;
            gap: 20px;
            font-size: 14px;
            color: #888;
        }}
        
        .stats span {{
            color: #00d4ff;
            font-weight: bold;
        }}
        
        .search-box {{
            margin-top: 15px;
        }}
        
        .search-box input {{
            width: 100%;
            max-width: 400px;
            padding: 10px 15px;
            border-radius: 8px;
            border: 1px solid #333;
            background: #1a1a2e;
            color: #fff;
            font-size: 14px;
        }}
        
        .search-box input:focus {{
            outline: none;
            border-color: #00d4ff;
        }}
        
        .container {{
            display: flex;
            min-height: calc(100vh - 150px);
        }}
        
        .sidebar {{
            width: 250px;
            background: #111;
            padding: 20px;
            border-right: 1px solid #222;
            overflow-y: auto;
            max-height: calc(100vh - 150px);
            position: sticky;
            top: 150px;
        }}
        
        .sidebar h3 {{
            font-size: 12px;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 15px;
            letter-spacing: 1px;
        }}
        
        .category-btn {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding: 10px 12px;
            margin-bottom: 5px;
            border: none;
            background: transparent;
            color: #aaa;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            text-align: left;
            transition: all 0.2s;
        }}
        
        .category-btn:hover {{
            background: #1a1a2e;
            color: #fff;
        }}
        
        .category-btn.active {{
            background: linear-gradient(135deg, #7c3aed 0%, #00d4ff 100%);
            color: #fff;
        }}
        
        .category-count {{
            background: #222;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 11px;
        }}
        
        .category-btn.active .category-count {{
            background: rgba(255,255,255,0.2);
        }}
        
        .main {{
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }}
        
        .type-section {{
            margin-bottom: 30px;
        }}
        
        .type-header {{
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #222;
        }}
        
        .type-header h2 {{
            font-size: 18px;
            color: #fff;
        }}
        
        .type-badge {{
            background: linear-gradient(135deg, #7c3aed, #00d4ff);
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 12px;
            color: #fff;
        }}
        
        .components-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
        }}
        
        .component-card {{
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 1px solid #222;
            border-radius: 12px;
            padding: 15px;
            transition: all 0.3s;
            cursor: pointer;
        }}
        
        .component-card:hover {{
            border-color: #00d4ff;
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0, 212, 255, 0.1);
        }}
        
        .component-name {{
            font-size: 16px;
            font-weight: 600;
            color: #fff;
            margin-bottom: 8px;
        }}
        
        .component-meta {{
            display: flex;
            gap: 15px;
            font-size: 12px;
            color: #888;
        }}
        
        .component-meta span {{
            display: flex;
            align-items: center;
            gap: 5px;
        }}
        
        .project-tag {{
            background: rgba(124, 58, 237, 0.2);
            color: #a78bfa;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
        }}
        
        .lines-badge {{
            background: rgba(0, 212, 255, 0.1);
            color: #00d4ff;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
        }}
        
        .no-results {{
            text-align: center;
            padding: 50px;
            color: #666;
        }}
        
        .hidden {{
            display: none !important;
        }}
        
        @media (max-width: 768px) {{
            .sidebar {{
                display: none;
            }}
            
            .container {{
                flex-direction: column;
            }}
        }}
    </style>
</head>
<body>
    <header class="header">
        <h1>Component Browser</h1>
        <div class="stats">
            <div><span id="total-count">{total}</span> компонентов</div>
            <div><span id="project-count">{total_projects}</span> проектов</div>
            <div><span id="category-count">{len(sorted_categories)}</span> категорий</div>
        </div>
        <div class="search-box">
            <input type="text" id="search" placeholder="Поиск компонентов...">
        </div>
    </header>
    
    <div class="container">
        <aside class="sidebar">
            <h3>Категории</h3>
            <button class="category-btn active" data-category="all">
                Все компоненты
                <span class="category-count">{total}</span>
            </button>
'''

# Add category buttons
for cat in sorted_categories:
    count = len(type_groups[cat])
    html += f'''            <button class="category-btn" data-category="{cat}">
                {cat}
                <span class="category-count">{count}</span>
            </button>
'''

html += '''        </aside>
        
        <main class="main" id="main-content">
'''

# Add component sections
for cat in sorted_categories:
    components = type_groups[cat]
    html += f'''            <section class="type-section" data-type="{cat}">
                <div class="type-header">
                    <h2>{cat}</h2>
                    <span class="type-badge">{len(components)}</span>
                </div>
                <div class="components-grid">
'''
    
    for comp in components:
        project = comp.get('project', 'unknown')
        lines = comp.get('lines', 0)
        name = comp.get('name', 'Unknown')
        
        html += f'''                    <div class="component-card" data-name="{name.lower()}" data-type="{cat}">
                        <div class="component-name">{name}</div>
                        <div class="component-meta">
                            <span class="project-tag">{project}</span>
                            <span class="lines-badge">{lines} строк</span>
                        </div>
                    </div>
'''
    
    html += '''                </div>
            </section>
'''

html += '''        </main>
    </div>
    
    <script>
        // Category filtering
        const categoryBtns = document.querySelectorAll('.category-btn');
        const sections = document.querySelectorAll('.type-section');
        
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const category = btn.dataset.category;
                
                // Show/hide sections
                sections.forEach(section => {
                    if (category === 'all' || section.dataset.type === category) {
                        section.classList.remove('hidden');
                    } else {
                        section.classList.add('hidden');
                    }
                });
            });
        });
        
        // Search functionality
        const searchInput = document.getElementById('search');
        const cards = document.querySelectorAll('.component-card');
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            
            cards.forEach(card => {
                const name = card.dataset.name;
                if (name.includes(query)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
            
            // Show all sections when searching
            if (query) {
                sections.forEach(section => section.classList.remove('hidden'));
                categoryBtns.forEach(btn => btn.classList.remove('active'));
                document.querySelector('[data-category="all"]').classList.add('active');
            }
        });
    </script>
</body>
</html>
'''

# Write output
with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Generated BROWSER.html with {total} unique components from {total_projects} projects")
print(f"Categories: {len(sorted_categories)}")
for cat in sorted_categories:
    print(f"  - {cat}: {len(type_groups[cat])} components")
