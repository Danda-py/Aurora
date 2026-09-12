import re

fs = open('src/components/vip/HostPortalModal.tsx', 'r')
content = fs.read()
fs.close()

# 1. Update Props and component signature
content = re.sub(
    r'interface Props \{[\s\S]*?onSelectPassToView\?: \(pass: GuestPass\) => void;\n\}',
    '''interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectPassToView?: (pass: GuestPass) => void;
  inlineMode?: boolean;
}''',
    content
)

content = re.sub(
    r'export const HostPortalModal: React\.FC<Props> = \(\{ isOpen, onClose, onSelectPassToView \}\) => \{',
    '''export const HostPortalModal: React.FC<Props> = ({ isOpen, onClose, onSelectPassToView, inlineMode = false }) => {''',
    content
)

content = re.sub(
    r'const \[isAuthenticated, setIsAuthenticated\] = useState\(false\);',
    r'const [isAuthenticated, setIsAuthenticated] = useState(true);',
    content
)

content = re.sub(
    r'  return \(\n    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">\n      <div className="relative w-full max-w-2xl my-auto bg-\[#18181b\] rounded-2xl sm:rounded-3xl border border-white/10 text-white shadow-2xl overflow-hidden max-h-\[94vh\] sm:max-h-\[92vh\] flex flex-col">',
    '''  const modalContent = (
      <div className={`relative w-full max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-gray-100 text-gray-800 shadow-sm overflow-hidden flex flex-col ${inlineMode ? 'min-h-[70vh]' : 'my-auto max-h-[94vh] sm:max-h-[92vh] shadow-2xl'}`}>''',
    content
)

content = re.sub(
    r'        {/\* Top Header \*/}\n        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-\[#1f1d1b\] border-b border-white/10 flex items-center justify-between shrink-0">\n          <div className="flex items-center gap-2\.5 sm:gap-3">\n            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">\n              <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />\n            </div>\n            <div className="min-w-0">\n              <h2 className="font-semibold text-sm sm:text-lg text-white leading-tight truncate">\n                Pannello Host • VIP Pass & Smart Lock\n              </h2>\n              <p className="text-\[11px\] sm:text-xs text-neutral-400 font-mono truncate">\n                Appartamento Aurora in Valtellina\n              </p>\n            </div>\n          </div>\n\n          <button\n            onClick=\{onClose\}\n            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0 ml-2"\n          >\n            <X className="w-4 h-4 sm:w-5 sm:h-5" />\n          </button>\n        </div>',
    '''        {/* Top Header */}
        {!inlineMode && (
          <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-700 shadow-sm shrink-0">
                <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-sm sm:text-lg text-gray-900 leading-tight truncate">
                  Pannello Host • VIP Pass & Smart Lock
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-500 font-mono truncate">
                  Appartamento Aurora in Valtellina
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-100 shadow-sm flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}''',
    content
)


content = re.sub(
    r'        {/\* Auth Barrier if not unlocked \*/}\n        \{\!isAuthenticated \? \([\s\S]*?Apri portale host\n            </a>\n          </div>\n        \) : \(',
    '''        {/* Auth Barrier if not unlocked */}
        {!isAuthenticated && !inlineMode ? (
          <div className="p-6 sm:p-8 text-center space-y-5 my-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 mx-auto">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">Portale host protetto</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                La gestione è disponibile esclusivamente nel portale host con autenticazione email e password.
              </p>
            </div>
            <a
              href="/host-portal/"
              className="inline-flex w-full max-w-xs justify-center rounded-xl bg-black py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 shadow-sm"
            >
              Apri portale host
            </a>
          </div>
        ) : (''',
    content
)

content = re.sub(
    r'          </>\n        \)\}\n\n      </div>\n    </div>\n  \);\n};',
    '''          </>
        )}

      </div>
  );
  
  if (inlineMode) return modalContent;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {modalContent}
    </div>
  );
};''',
    content
)

fs = open('src/components/vip/HostPortalModal.tsx', 'w')
fs.write(content)
fs.close()

