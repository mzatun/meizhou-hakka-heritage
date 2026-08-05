# -*- coding: utf-8 -*-
"""部署梅州客家非遗门户到服务器 /opt/haka，nginx 子路径 /haka/ 上线。
服务器 ubuntu 已配 NOPASSWD sudo，root 命令直接加 sudo 前缀即可。
"""
import os, paramiko

HOST='111.229.64.11'; PORT=22; USER='ubuntu'; PASS='Fang020708'
LOCAL=r"F:/网易龙虾/教学相长/梅州客家非遗_课程门户网站_20260805"
REMOTE_BASE="/opt/haka"

def log(s): print(s, flush=True)

client=paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST,PORT,USER,PASS,timeout=20)
sftp=client.open_sftp()

def ssh(cmd):
    stdin,stdout,stderr=client.exec_command(cmd)
    return stdout.read().decode(errors='replace'), stderr.read().decode(errors='replace')

def sudo(cmd):
    return ssh(f"sudo {cmd}")

# ---------- 1. 准备目录（sudo）----------
log("=== [1] 清理并创建 /opt/haka ===")
o,e=sudo(f"bash -c 'rm -rf {REMOTE_BASE} /opt/haka_test && mkdir -p {REMOTE_BASE} && chown ubuntu:ubuntu {REMOTE_BASE} && chmod 755 {REMOTE_BASE}'")
log(o or "(ok)"); log("ERR:"+e) if e.strip() else None

# ---------- 2. SFTP 上传（保持目录结构）----------
log("=== [2] SFTP 上传全部文件 ===")
count=0
def upload(local, remote):
    global count
    for item in sorted(os.listdir(local)):
        l=os.path.join(local,item); r=remote+"/"+item
        if os.path.isdir(l):
            try: sftp.stat(r)
            except IOError: sftp.mkdir(r)
            upload(l,r)
        else:
            sftp.put(l,r); count+=1
upload(LOCAL, REMOTE_BASE)
log(f"上传完成，共 {count} 个文件 -> {REMOTE_BASE}")

# ---------- 3. 追加 nginx 配置（sudo）----------
log("=== [3] 写 nginx /haka/ 配置 ===")
block=(
    "\n"
    "\t# --- haka 梅州客家非遗沉浸式门户 (static, subpath) ---\n"
    "\tlocation = /haka {\n"
    "\t\treturn 301 /haka/;\n"
    "\t}\n"
    "\tlocation /haka/ {\n"
    "\t\talias /opt/haka/;\n"
    "\t\tindex index.html;\n"
    "\t\ttry_files $uri $uri/ /haka/index.html;\n"
    "\t}\n"
)
tmp="/tmp/haka.nginx.block"
with open(tmp,"w",encoding="utf-8") as f: f.write(block)
sftp.put(tmp, tmp)
o,e=sudo(f"bash -c 'cat {tmp} >> /etc/nginx/sites-available/default'")
log("append out:",o); log("append err:",e) if e.strip() else None

# ---------- 4. 校验并重载 ----------
log("=== [4] nginx -t ===")
o,e=sudo("nginx -t")
log(o); log("ERR:"+e) if e.strip() else None
log("=== [5] nginx reload ===")
o,e=sudo("nginx -s reload")
log(o or "(reloaded)"); log("ERR:"+e) if e.strip() else None

# ---------- 5. 远端自检 ----------
log("=== [6] 远端自检 /haka/ 资源 ===")
for p in ["/haka/","/haka/assets/img/home-cover.png","/haka/data/chapters.json",
          "/haka/downloads/meizhou-hakka-heritage-notes.docx","/haka/docs/system-architecture.html"]:
    o,e=ssh(f"curl -s -o /dev/null -w '{p} -> %{{http_code}}' http://127.0.0.1{p}")
    log(o)

sftp.close(); client.close()
log("=== DONE ===")
