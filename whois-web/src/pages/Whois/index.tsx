import React, {useState} from 'react';
import {Form, Input, Button, Card, Row, Col, Spin, Table} from 'antd';
import {queryWhois} from '@/services/whois';

const WhoisPage: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (values: any) => {
    setLoading(true);
    try {
      const response = await queryWhois(values.domain);
      setResult(response);
    } catch (error) {
      setResult({error: `查询错误: ${error}`});
    } finally {
      setLoading(false);
    }
  };

  // 定义表格列
  const columns = [
    {
      title: '属性',
      dataIndex: 'key',
      key: 'key',
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      render: (text: any) => <pre style={{margin: 0}}>{text}</pre>,
    },
  ];

  // 将WHOIS响应数据转换为表格数据，只包含特定的键
  const whoisResponseToTableData = (response: string) => {
    const lines = response.split('\n');
    const tableData: any[] = [];
    const keysToInclude = [
      'Domain Name',
      'Registry Domain ID',
      'Registrar WHOIS Server',
      'Registrar URL',
      'Updated Date',
      'Creation Date',
      'Registry Expiry Date',
      'Registrar',
      'Registrar IANA ID',
      'Registrar Abuse Contact Email',
      'Registrar Abuse Contact Phone',
      'Domain Status',
      'Name Server',
      'DNSSEC',
    ];
    const keyTranslations = {
      'Domain Name': '域名',
      'Registry Domain ID': '注册域名ID',
      'Registrar WHOIS Server': '注册商WHOIS服务器',
      'Registrar URL': '注册商URL',
      'Updated Date': '更新日期',
      'Creation Date': '创建日期',
      'Registry Expiry Date': '注册到期日期',
      'Registrar': '注册商',
      'Registrar IANA ID': '注册商IANA ID',
      'Registrar Abuse Contact Email': '注册商滥用联系邮箱',
      'Registrar Abuse Contact Phone': '注册商滥用联系电话',
      'Domain Status': '域名状态',
      'Name Server': '名称服务器',
      'DNSSEC': 'DNSSEC',
    };

    lines.forEach(line => {
      const index = line.indexOf(':');
      if (index !== -1) {
        const key = line.substring(0, index).trim();
        let value = line.substring(index + 1).trim();
        if (keysToInclude.includes(key)) {
          // 检查并格式化日期
          if (['Updated Date', 'Creation Date', 'Registry Expiry Date'].includes(key)) {
            const date = new Date(value);
            value = date.toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }).replace(/\//g, '-');
          }
          tableData.push({key: keyTranslations[key] || key, value});
        }
      }
    });
    return tableData;
  };

  // 将结果对象转换为表格数据
  const tableData = result && result.response && whoisResponseToTableData(result.response);

  return (
    <Row justify="center" align="middle" style={{minHeight: '100vh'}}>
      <Col xs={24} sm={20} md={16} lg={12} xl={14}>
        <Card title="WHOIS 查询" bordered={false} style={{boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}>
          <Form onFinish={handleSearch} layout="vertical">
            <Form.Item
              name="domain"
              rules={[{required: true, message: '请输入域名!'}]}
            >
              <Input
                placeholder="请输入域名"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                style={{fontSize: '16px'}}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{width: '100%', fontSize: '16px'}}
              >
                查询
              </Button>
            </Form.Item>
          </Form>
          {loading && (
            <div style={{textAlign: 'center', marginTop: 16}}>
              <Spin size="large"/>
            </div>
          )}
          {result && !loading && (
            <div style={{marginTop: 16}}>
              <Table
                dataSource={tableData}
                columns={columns}
                pagination={false}
                scroll={{x: 'max-content'}}
                style={{minWidth: '100%'}}
              />
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default WhoisPage;
