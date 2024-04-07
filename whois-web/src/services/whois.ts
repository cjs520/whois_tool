// src/services/whois.ts
import request from '@/utils/request';

export async function queryWhois(domain: string) {
  return request.get(`/whois?domain=${domain}`);
}
