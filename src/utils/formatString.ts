export function formatString(template: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce((result, [key, value]) => {
    const placeholder = new RegExp(`\\{${key}\\}`, 'g');
    return result.replace(placeholder, String(value));
  }, template);
}

