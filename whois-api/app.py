import re
import socket
import json
from flask import Flask, jsonify, request

app = Flask(__name__)

# 加载 whois.json 文件中的映射关系
with open('whois.json', 'r', encoding='utf-8') as file:
    whois_servers = json.load(file)



@app.route('/whois', methods=['GET', 'OPTIONS'])
def get_whois_server():
    # 解析请求参数中的域名
    domain = request.args.get('domain')

    # 使用正则表达式提取域名后缀
    match = re.search(r'^(?P<domain>[\w-]+)\.(?P<suffix>[\w-]+)$', domain)
    if not match:
        return jsonify({"error": "Invalid domain format."}), 400

    domain_suffix = match.group('suffix').upper()

    # 查找对应的 Whois 服务器地址
    server = whois_servers.get(domain_suffix)
    if not server:
        return jsonify({"error": "Domain suffix not found in the Whois servers mapping."}),404

    # 使用 socket 连接 Whois 服务器
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((server, 43))

    # 发送查询请求
    sock.sendall(f"{domain} \r\n".encode('utf-8'))

    # 接收 Whois 服务器的响应
    response = sock.recv(4096).decode('utf-8')
    
    

    # 关闭 socket 连接
    sock.close()
    response=jsonify({"response" : response})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'OPTIONS,GET,POST')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')

    # 返回 Whois 服务器的响应
    return response


if __name__ == '__main__':
    app.run(debug=True)
