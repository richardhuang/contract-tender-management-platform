import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, DatePicker, Select, InputNumber, message } from 'antd';
import moment from 'moment';

const { Option } = Select;

const TendersPage = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTender, setEditingTender] = useState(null);
  const [form] = Form.useForm();

  // Load tenders from API
  const loadTenders = async () => {
    setLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3001/api/tenders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTenders(data.tenders || []);
      } else {
        message.error('获取招标列表失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenders();
  }, []);

  const showModal = (tender = null) => {
    setEditingTender(tender);
    if (tender) {
      form.setFieldsValue({
        ...tender,
        start_date: tender.start_date ? moment(tender.start_date) : null,
        end_date: tender.end_date ? moment(tender.end_date) : null,
        bid_opening_date: tender.bid_opening_date ? moment(tender.bid_opening_date) : null,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingTender(null);
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
      if (values.bid_opening_date) {
        values.bid_opening_date = values.bid_opening_date.format('YYYY-MM-DD');
      }

      const token = localStorage.getItem('token');
      let response;

      if (editingTender) {
        // Update existing tender
        response = await fetch(`http://localhost:3001/api/tenders/${editingTender.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        });
      } else {
        // Create new tender
        response = await fetch('http://localhost:3001/api/tenders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        });
      }

      if (response.ok) {
        message.success(editingTender ? '招标更新成功' : '招标创建成功');
        handleCancel();
        loadTenders(); // Refresh the list
      } else {
        const errorData = await response.json();
        message.error(errorData.message || (editingTender ? '更新失败' : '创建失败'));
      }
    } catch (error) {
      message.error('表单验证失败');
    }
  };

  const deleteTender = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个招标吗？此操作不可撤销。',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:3001/api/tenders/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            message.success('招标删除成功');
            loadTenders(); // Refresh the list
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

  const publishTender = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/tenders/${id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        message.success('招标发布成功');
        loadTenders(); // Refresh the list
      } else {
        const errorData = await response.json();
        message.error(errorData.message || '发布失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    }
  };

  const columns = [
    {
      title: '招标编号',
      dataIndex: 'tender_number',
      key: 'tender_number',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          draft: '草稿',
          published: '已发布',
          bidding: '招标中',
          closed: '已关闭',
          awarded: '已授标',
          cancelled: '已取消'
        };
        return statusMap[status] || status;
      }
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget) => budget ? `¥${budget}` : '-'
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date) => date ? moment(date).format('YYYY-MM-DD') : '-'
    },
    {
      title: '截止日期',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date) => date ? moment(date).format('YYYY-MM-DD') : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button
            type="link"
            size="small"
            disabled={record.status !== 'draft'}
            onClick={() => publishTender(record.id)}
          >
            发布
          </Button>
          <Button type="link" size="small" onClick={() => showModal(record)}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => deleteTender(record.id)}>删除</Button>
        </span>
      ),
    },
  ];

  return (
    <Card
      title="招标管理"
      extra={
        <Button type="primary" onClick={() => showModal()}>
          新增招标
        </Button>
      }
    >
      <Table
        dataSource={tenders}
        columns={columns}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingTender ? "编辑招标" : "新增招标"}
        open={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'draft'
          }}
        >
          <Form.Item
            name="title"
            label="招标标题"
            rules={[{ required: true, message: '请输入招标标题!' }]}
          >
            <Input placeholder="请输入招标标题" />
          </Form.Item>

          <Form.Item
            name="tender_number"
            label="招标编号"
            rules={[{ required: true, message: '请输入招标编号!' }]}
          >
            <Input placeholder="请输入招标编号" />
          </Form.Item>

          <Form.Item
            name="description"
            label="招标描述"
          >
            <Input.TextArea rows={4} placeholder="请输入招标描述" />
          </Form.Item>

          <Form.Item
            name="budget"
            label="预算金额"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入预算金额"
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/¥\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="开始日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="截止日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="bid_opening_date"
            label="开标日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="招标状态"
          >
            <Select placeholder="请选择招标状态">
              <Option value="draft">草稿</Option>
              <Option value="published">已发布</Option>
              <Option value="bidding">招标中</Option>
              <Option value="closed">已关闭</Option>
              <Option value="awarded">已授标</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TendersPage;