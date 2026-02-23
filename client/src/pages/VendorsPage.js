import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, InputNumber, message } from 'antd';

const { Option } = Select;

const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [form] = Form.useForm();

  // Load vendors from API
  const loadVendors = async () => {
    setLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3001/api/vendors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVendors(data.vendors || []);
      } else {
        message.error('获取供应商列表失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const showModal = (vendor = null) => {
    setEditingVendor(vendor);
    if (vendor) {
      form.setFieldsValue(vendor);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingVendor(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const token = localStorage.getItem('token');
      let response;

      if (editingVendor) {
        // Update existing vendor
        response = await fetch(`http://localhost:3001/api/vendors/${editingVendor.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        });
      } else {
        // Create new vendor
        response = await fetch('http://localhost:3001/api/vendors', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        });
      }

      if (response.ok) {
        message.success(editingVendor ? '供应商更新成功' : '供应商创建成功');
        handleCancel();
        loadVendors(); // Refresh the list
      } else {
        const errorData = await response.json();
        message.error(errorData.message || (editingVendor ? '更新失败' : '创建失败'));
      }
    } catch (error) {
      message.error('表单验证失败');
    }
  };

  const deleteVendor = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个供应商吗？此操作不可撤销。',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:3001/api/vendors/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            message.success('供应商删除成功');
            loadVendors(); // Refresh the list
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
      title: '公司名称',
      dataIndex: 'company_name',
      key: 'company_name',
    },
    {
      title: '联系人',
      dataIndex: 'contact_person',
      key: 'contact_person',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '税号',
      dataIndex: 'tax_id',
      key: 'tax_id',
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => rating ? rating.toFixed(2) : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          active: '活跃',
          inactive: '非活跃',
          blacklisted: '黑名单'
        };
        return statusMap[status] || status;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button type="link" size="small" onClick={() => showModal(record)}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => deleteVendor(record.id)}>删除</Button>
        </span>
      ),
    },
  ];

  return (
    <Card
      title="供应商管理"
      extra={
        <Button type="primary" onClick={() => showModal()}>
          新增供应商
        </Button>
      }
    >
      <Table
        dataSource={vendors}
        columns={columns}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingVendor ? "编辑供应商" : "新增供应商"}
        open={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active'
          }}
        >
          <Form.Item
            name="company_name"
            label="公司名称"
            rules={[{ required: true, message: '请输入公司名称!' }]}
          >
            <Input placeholder="请输入公司名称" />
          </Form.Item>

          <Form.Item
            name="contact_person"
            label="联系人"
            rules={[{ required: true, message: '请输入联系人!' }]}
          >
            <Input placeholder="请输入联系人姓名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="联系电话"
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>

          <Form.Item
            name="address"
            label="地址"
          >
            <Input.TextArea placeholder="请输入公司地址" rows={3} />
          </Form.Item>

          <Form.Item
            name="tax_id"
            label="税号"
          >
            <Input placeholder="请输入税号" />
          </Form.Item>

          <Form.Item
            name="rating"
            label="评分"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入评分 (0-5)"
              min={0}
              max={5}
              step={0.1}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择供应商状态!' }]}
          >
            <Select placeholder="请选择供应商状态">
              <Option value="active">活跃</Option>
              <Option value="inactive">非活跃</Option>
              <Option value="blacklisted">黑名单</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default VendorsPage;