export function interpolatePlaceholders(
  template: string,
  values: Array<string | number>
): string {
  let result = template;
  values.forEach((value, index) => {
    result = result.replace(new RegExp(`\\{${index}\\}`, "g"), String(value));
  });
  return result;
}
