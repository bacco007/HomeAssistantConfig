import os

editor_path = r"C:\Users\mail\Downloads\Reterminal - 0.2\custom_components\reterminal_dashboard\frontend\editor.html"

with open(editor_path, 'r', encoding='utf-8') as f:
    html = f.read()

print(f"Original length: {len(html)}")
check_css = 'href="editor.css"' in html
check_js = 'src="editor.js"' in html
print(f"Contains href=\"editor.css\": {check_css}")
print(f"Contains src=\"editor.js\": {check_js}")

html_replaced = html.replace('href="editor.css"', 'href="/reterminal-dashboard/static/editor.css?v=1"')
html_replaced = html_replaced.replace('src="editor.js"', 'src="/reterminal-dashboard/static/editor.js?v=1"')

print(f"Replaced length: {len(html_replaced)}")
check_new_css = 'href="/reterminal-dashboard/static/editor.css?v=1"' in html_replaced
check_new_js = 'src="/reterminal-dashboard/static/editor.js?v=1"' in html_replaced
print(f"Contains new CSS link: {check_new_css}")
print(f"Contains new JS src: {check_new_js}")

if html == html_replaced:
    print("WARNING: No changes made!")
else:
    print("SUCCESS: Replacements made.")
