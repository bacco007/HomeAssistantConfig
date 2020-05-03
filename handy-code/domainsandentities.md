domains:
 
{%- set unique_domains = states | map(attribute='domain') |list | unique | list -%}
{%- for domain in unique_domains -%}
{{"\n"}}- {{domain}}
{%- endfor -%}
{{"\n"}}

entities:
 
{%- for state in states -%}
{{"\n"}}- {{state.entity_id}}
{%- endfor -%}