import re

fs = open('src/components/vip/HostPortalModal.tsx', 'r')
content = fs.read()
fs.close()

# Replace specific background and border classes with light theme equivalents
replacements = {
    'bg-black/40': 'bg-gray-50',
    'border-white/10': 'border-gray-200',
    'border-white/15': 'border-gray-200',
    'bg-white/10': 'bg-gray-100',
    'bg-white/5': 'bg-gray-50',
    'bg-white/[0.04]': 'bg-gray-50',
    'bg-white/[0.03]': 'bg-gray-50',
    'border-white/[0.06]': 'border-gray-200',
    'text-white': 'text-gray-900',
    'text-slate-400': 'text-gray-500',
    'text-slate-300': 'text-gray-600',
    'text-slate-200': 'text-gray-700',
    'text-neutral-400': 'text-gray-500',
    'text-neutral-300': 'text-gray-600',
    'text-neutral-200': 'text-gray-700',
    'text-neutral-950': 'text-white',
    'bg-white': 'bg-black',
    'hover:bg-white/20': 'hover:bg-gray-200',
    'hover:bg-white/15': 'hover:bg-gray-200',
    'hover:bg-neutral-200': 'hover:bg-gray-800',
    'bg-[#141824]': 'bg-white',
    'bg-black/60': 'bg-gray-100',
    'bg-black/50': 'bg-gray-100',
    'bg-zinc-900': 'bg-white',
    'bg-zinc-800': 'bg-gray-100',
    'text-zinc-400': 'text-gray-500',
    'border-zinc-700': 'border-gray-200',
    'bg-[#1f1d1b]': 'bg-gray-50',
    'bg-emerald-500/20': 'bg-emerald-100',
    'text-emerald-300': 'text-emerald-700',
    'border-emerald-500/40': 'border-emerald-200',
    'border-emerald-500/30': 'border-emerald-200',
    'bg-emerald-600/20': 'bg-emerald-100',
    'bg-emerald-600/30': 'hover:bg-emerald-200',
    'bg-sky-500/20': 'bg-sky-100',
    'text-sky-300': 'text-sky-700',
    'border-sky-500/40': 'border-sky-200',
    'border-white/40': 'border-gray-300',
    'bg-emerald-500/10': 'bg-emerald-50',
    'bg-rose-500/10': 'bg-rose-50',
    'bg-black/30': 'bg-gray-50',
    'focus:border-white/40': 'focus:border-gray-300',
    'focus:border-gray-300': 'focus:ring-2 focus:ring-gray-100 focus:border-gray-300',
    'text-emerald-200': 'text-emerald-700',
    'text-emerald-400': 'text-emerald-600'
}

for old, new in replacements.items():
    if old == 'bg-white' and new == 'bg-black':
        # Need to be careful not to break everything. Only replace specific buttons.
        content = re.sub(r'bg-white hover:bg-neutral-200 text-neutral-950', 'bg-black hover:bg-gray-800 text-white', content)
        content = re.sub(r'bg-white hover:bg-gray-800 text-white', 'bg-black hover:bg-gray-800 text-white', content)
    elif old == 'text-white' and new == 'text-gray-900':
        content = re.sub(r'text-white', 'text-gray-900', content)
        # Fix the buttons that were inverted
        content = re.sub(r'bg-black hover:bg-gray-800 text-gray-900', 'bg-black hover:bg-gray-800 text-white', content)
        content = re.sub(r'bg-emerald-600 hover:bg-emerald-500 text-gray-900', 'bg-emerald-600 hover:bg-emerald-500 text-white', content)
        content = re.sub(r'bg-sky-600 hover:bg-sky-500 text-gray-900', 'bg-sky-600 hover:bg-sky-500 text-white', content)
        content = re.sub(r'bg-zinc-800 hover:bg-zinc-700 text-gray-900', 'bg-gray-800 hover:bg-gray-700 text-white', content)
    else:
        content = content.replace(old, new)


fs = open('src/components/vip/HostPortalModal.tsx', 'w')
fs.write(content)
fs.close()
