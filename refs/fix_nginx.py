# -*- coding: utf-8 -*-
"""修复 nginx default：将错放在 server 外的 haka 块移入 server 内（location / 之前）。"""
import paramiko
HOST='111.229.64.11'; USER='ubuntu'; PASS='Fang020708'
c=paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST,22,USER,PASS,timeout=15)
sftp=c.open_sftp()
sftp.get('/etc/nginx/sites-available/default','/tmp/default.bak')
with open('/tmp/default.bak',encoding='utf-8') as f: content=f.read()

# 1. 删除错误追加的 haka 块（从标记到文件末尾）
idx=content.find('# --- haka')
content=content[:idx].rstrip()+'\n' if idx!=-1 else content.rstrip()+'\n'

# 2. haka 块
hakablock=("\n"
  "\t# --- haka 梅州客家非遗沉浸式门户 (static, subpath) ---\n"
  "\tlocation = /haka {\n\t\treturn 301 /haka/;\n\t}\n"
  "\tlocation /haka/ {\n\t\talias /opt/haka/;\n\t\tindex index.html;\n"
  "\t\ttry_files $uri $uri/ /haka/index.html;\n\t}\n")

# 3. 插入到 'location / {' 之前（server 内，与 aichuang/zyl 并列）
pos=content.find('location / {')
if pos==-1:
    pos=content.rfind('}')   # 兜底
content=content[:pos]+hakablock+content[pos:]

with open('/tmp/default.new','w',encoding='utf-8') as f: f.write(content)
sftp.put('/tmp/default.new','/tmp/default.new')

def run(cmd):
    stdin,stdout,stderr=c.exec_command(cmd)
    return stdout.read().decode(errors='replace'), stderr.read().decode(errors='replace')

o,e=run("sudo cp /tmp/default.new /etc/nginx/sites-available/default")
print("cp:",o,e)
o,e=run("sudo nginx -t"); print("nginx -t:",o.strip(),e.strip())
o,e=run("sudo nginx -s reload"); print("reload:",(o or "OK"),e.strip())

print("--- 远端自检 ---")
for p in ["/haka/","/haka/assets/img/home-cover.png","/haka/data/chapters.json",
          "/haka/gallery.html","/haka/downloads/meizhou-hakka-heritage-notes.docx",
          "/haka/docs/visual-design.html"]:
    o,e=run(f"curl -s -o /dev/null -w '{p} -> %{{http_code}}' http://127.0.0.1{p}")
    print(o)
# 确认 aichuang/zyl 不受影响
for p in ["/aichuang/","/zyl/"]:
    o,e=run(f"curl -s -o /dev/null -w '{p} -> %{{http_code}}' http://127.0.0.1{p}")
    print(o)
c.close()
