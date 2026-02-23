import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, DatePicker, Select, InputNumber, message } from 'antd';
import moment from 'moment';

const { Option } = Select;

const ContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [form] = Form.useForm();

  // Load contracts from API
  const loadContracts = async () => {
    setLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3001/api/contracts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContracts(data.contracts || []);
      } else {
        message.error('获取合同列表失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const showModal = (contract = null) => {
    setEditingContract(contract);
    if (contract) {
      form.setFieldsValue({
        ...contract,
        start_date: contract.start_date ? moment(contract.start_date) : null,
        end_date: contract.end_date ? moment(contract.end_date) : null,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingContract(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Format dates
      if (values.start_date) {
        values.start_date = values.start_date.format('YYYY-MM-DD');
      }
      if (values.end_date) {
        values.end_date = values.end_date.format('YYYY-MM-DD');
      }

      const token = localStorage.getItem('token');
      let response;

      if (editingContract) {
        // Update existing contract
        response = await fetch(`http://localhost:3001/api/contracts/${editingContract.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        });
      } else {
        // Create new contract
        response = await fetch('http://localhost:3001/api/contracts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        });
      }

      if (response.ok) {
        message.success(editingContract ? '合同更新成功' : '合同创建成功');
        handleCancel();
        loadContracts(); // Refresh the list
      } else {
        const errorData = await response.json();
        message.error(errorData.message || (editingContract ? '更新失败' : '创建失败'));
      }
    } catch (error) {
      message.error('表单验证失败');
    }
  };

  const deleteContract = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个合同吗？此操作不可撤销。',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:3001/api/contracts/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            message.success('合同删除成功');
            loadContracts(); // Refresh the list
          } else {
            const errorData = await response.json();
            message.error(errorData.message || '删除失败');
          }
        } catch (error) {
          message.error('网络错误，请稍后重试');
        }
      }
    });
  };

  const columns = [
    {
      title: '合同编号',
      dataIndex: 'contract_number',
      key: 'contract_number',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          draft: '草稿',
          pending_approval: '待审批',
          approved: '已批准',
          active: '进行中',
          expired: '已过期',
          terminated: '已终止'
        };
        return statusMap[status] || status;
      }
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date) => date ? moment(date).format('YYYY-MM-DD') : '-'
    },
    {
      title: '结束日期',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date) => date ? moment(date).format('YYYY-MM-DD') : '-'
    },
    {
      title: '金额',
      dataIndex: 'value',
      key: 'value',
      render: (value, record) => `${record.currency || 'USD'} ${value || 0}`
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button type="link" size="small" onClick={() => showModal(record)}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => deleteContract(record.id)}>删除</Button>
        </span>
      ),
    },
  ];

  return (
    <Card
      title="合同管理"
      extra={
        <Button type="primary" onClick={() => showModal()}>
          新增合同
        </Button>
      }
    >
      <Table
        dataSource={contracts}
        columns={columns}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingContract ? "编辑合同" : "新增合同"}
        open={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'service',
            status: 'draft',
            currency: 'USD'
          }}
        >
          <Form.Item
            name="title"
            label="合同标题"
            rules={[{ required: true, message: '请输入合同标题!' }]}
          >
            <Input placeholder="请输入合同标题" />
          </Form.Item>

          <Form.Item
            name="contract_number"
            label="合同编号"
            rules={[{ required: true, message: '请输入合同编号!' }]}
          >
            <Input placeholder="请输入合同编号" />
          </Form.Item>

          <Form.Item
            name="type"
            label="合同类型"
            rules={[{ required: true, message: '请选择合同类型!' }]}
          >
            <Select placeholder="请选择合同类型">
              <Option value="service">服务合同</Option>
              <Option value="product">产品合同</Option>
              <Option value="construction">建设合同</Option>
              <Option value="consulting">咨询合同</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="合同状态"
            rules={[{ required: true, message: '请选择合同状态!' }]}
          >
            <Select placeholder="请选择合同状态">
              <Option value="draft">草稿</Option>
              <Option value="pending_approval">待审批</Option>
              <Option value="approved">已批准</Option>
              <Option value="active">进行中</Option>
              <Option value="expired">已过期</Option>
              <Option value="terminated">已终止</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="start_date"
            label="开始日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="结束日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="value"
            label="合同金额"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入合同金额"
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/¥\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="currency"
            label="货币单位"
          >
            <Select placeholder="请选择货币单位">
              <Option value="USD">美元 (USD)</Option>
              <Option value="EUR">欧元 (EUR)</Option>
              <Option value="CNY">人民币 (CNY)</Option>
              <Option value="GBP">英镑 (GBP)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="terms"
            label="合同条款"
          >
            <Input.TextArea rows={4} placeholder="请输入合同条款" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ContractsPage;