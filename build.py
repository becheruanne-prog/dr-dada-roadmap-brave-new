import json, sys
STATIC = '--static' in sys.argv
head = open('head.html').read()
logic = open('logic.js').read()
state = json.load(open('state.json'))
tail = '<script>\n' + logic + '\n</script>'
def js_str(o):  # JSON literal safe inside a <script>
    return json.dumps(o, ensure_ascii=False).replace('</', '<\\/')
state_block = f'<script id="state" type="application/json">{js_str(state)}</script>'
src_block = f'<script>window.__SRC={js_str([head, tail])};</script>'
out = head + state_block + '\n' + tail + '\n' + ('' if STATIC else src_block + '\n')
if STATIC:
    open('index.html','w').write(out)
    open('hjhl-roadmap-static.html','w').write(out)
else:
    open('hjhl-roadmap.html','w').write(out)
print('built', len(out), 'bytes')
