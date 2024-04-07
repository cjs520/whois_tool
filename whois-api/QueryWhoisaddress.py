import aiohttp
import asyncio
from bs4 import BeautifulSoup
import json

async def fetch_whois(session, domain):
    try:
        params = {'q': '1.' + domain}
        async with session.get('https://www.iana.org/whois', params=params) as response:
            if response.status == 200:
                return await response.text()
            else:
                return None
    except aiohttp.ClientError as e:
        print(f"Error fetching WHOIS data for {domain}: {e}")
        return None

async def parse_whois(text):
    if text:
        try:
            soup = BeautifulSoup(text, 'html.parser')
            pre_tags = soup.find_all('pre')
            result = {}
            for pre in pre_tags:
                lines = pre.text.split('\n')
                domain_value = None
                refer_value = None
                for line in lines:
                    if 'domain:' in line.lower():
                        parts = line.split(':')
                        if len(parts) > 1:
                            domain_value = parts[1].strip()
                    elif 'refer:' in line.lower():
                        parts = line.split(':')
                        if len(parts) > 1:
                            refer_value = parts[1].strip()
                    if domain_value and refer_value:
                        result[domain_value] = refer_value
                        domain_value = None
                        refer_value = None
            return result
        except Exception as e:
            print(f"Error parsing WHOIS data for {domain}: {e}")
            return None
    return None

async def write_results_to_file(results):
    with open('whois.json', 'w', encoding='utf-8') as json_file:
        json_file.write(json.dumps(results, ensure_ascii=False, indent=4) + '\n')

async def process_domains(domains_chunk, results):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_whois(session, domain) for domain in domains_chunk]
        raw_responses = await asyncio.gather(*tasks)
        parsed_results = [await parse_whois(response) for response in raw_responses]
        for result in parsed_results:
            if result:
                results.update(result)
        await write_results_to_file(results)

async def main(domains):
    # 初始化一个空字典来存储结果
    results = {}
    
    # 将域名列表分成大小为10的块
    chunks = [domains[i:i + 10] for i in range(0, len(domains), 10)]
    
    # 对每个块进行处理
    for chunk in chunks:
        await process_domains(chunk, results)

# 读取list.txt文件中的每一行
with open('list.txt', 'r') as file:
    domains = [domain.strip() for domain in file.readlines()]


# 运行异步事件循环
asyncio.run(main(domains))
