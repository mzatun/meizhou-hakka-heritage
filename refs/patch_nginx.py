# -*- coding: utf-8 -*-
"""仅补充 nginx /haka/ 配置并重载（文件已上传，无需重传）。幂等：已存在则跳过。"""
import paramiko
HOST='111.229.64.11'; USER='ubuntu'; PASS='Fang020708'
c=paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST,22,USER,PASS,timeout=15)
def run(cmd):
    stdin,stdout,stderr=c.exec_command(cmd)
    return stdout.read().decode(errors='replace'), stderr.read().decode(errors='replace')

o,_=run("grep -c 'location /haka/' /etc/nginx/sites-available/default")
print("已有 /haka/ 配置行数:", o.strip())
if o.strip()=='0':
    block=("\n"
      "\t# --- haka 梅州客家非遗沉浸式门户 (static, subpath) ---\n"
      "\tlocation = /haka {\n\t\treturn 301 /haka/;\n\t}\n"
      "\tlocation /haka/ {\n\t\talias /opt/haka/;\n\t\tindex index.html;\n"
      "\t\ttry_files $uri $uri/ /haka/index.html;\n\t}\n")
    sftp=c.open_sftp()
    with open("/tmp/haka.block","w",encoding="utf-8") as f: f.write(block)
    sftp.put("/tmp/haka.block","/tmp/haka.block")
    o,e=run("sudo bash -c 'cat /tmp/haka.block >> /etc/nginx/sites-available/default'")
    print("追加结果 out:",o,"err:",e)
else:
    print("已存在，跳过追加")

o,e=run("sudo nginx -t"); print("nginx -t:", o.strip(), e.strip())
o,e=run("sudo nginx -s reload"); print("reload:", (o or "OK"), e.strip())

print("--- 远端自检 (127.0.0.1) ---")
for p in ["/haka/","/haka/assets/img/home-cover.png","/haka/data/chapters.json",
          "/haka/downloads/meizhou-hakka-heritage-notes.docx","/haka/docs/visual-design.html",
          "/haka/gallery.html"]:
    o,e=run(f"curl -s -o /dev/null -w '{p} -> %{{http_code}}' http://127.0.0.1{p}")
    print(o)
c.close()
