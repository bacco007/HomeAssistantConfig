#####################################################################################
# Render a YAML file by using a Jinja2 template file and a YAML data file.
#
# USAGE: python create-yaml-from-jinja.py [-h] [-t TEMPLATE] [-d DATA] [> OUTPUT.yaml]
#####################################################################################
import yaml
import jinja2
import argparse

def main():
    # Parse the command line arguments.
    parser = argparse.ArgumentParser(description='Render a YAML file by using a Jinja2 template file and a YAML data file.')
    parser.add_argument('-t', '--template', type=argparse.FileType('r'), help='The Jinja2 template file')
    parser.add_argument('-d', '--data', type=argparse.FileType('r'), help='The YAML data file')
    args = parser.parse_args()

    # Read the content of the files.
    data_file = args.data.read()
    template_file = args.template.read()

    # Load the YAML data.
    data = yaml.load(data_file, Loader=yaml.SafeLoader)

    # Load the template object.
    template = jinja2.Template(template_file)

    # Render the template using the data and print it to STDOUT.
    print(template.render(data))

    return

if __name__ == "__main__":
    main()