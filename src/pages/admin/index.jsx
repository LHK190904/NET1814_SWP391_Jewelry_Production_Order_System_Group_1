import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Table,
  Typography,
  message,
} from "antd";
import axios from "axios";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { getToken } from "../../services/authService";
const { Option } = Select;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const [visible, setVisible] = useState(false); // State to handle password visibility

  const toggleVisibility = () => {
    setVisible(!visible);
  };

  let inputNode;
  if (dataIndex === "title") {
    inputNode = (
      <Select>
        <Option value="SALE_STAFF">Nhân viên bán hàng</Option>
        <Option value="DESIGN_STAFF">Nhân viên thiết kế</Option>
        <Option value="MANAGER">Quản lí</Option>
        <Option value="PRODUCTION_STAFF">Nhân viên gia công</Option>
      </Select>
    );
  } else if (dataIndex === "password") {
    inputNode = (
      <Input.Password
        iconRender={(visible) =>
          visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
        }
        visibilityToggle
      />
    );
  } else {
    inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            { required: true, message: `Không được để trống` },
            ...(dataIndex === "email"
              ? [{ type: "email", message: "Email không hợp lệ" }]
              : []),
            ...(dataIndex === "userName"
              ? [
                  {
                    validator: (_, value) => {
                      if (value !== value.trim()) {
                        return Promise.reject(
                          new Error(
                            "Không được có khoảng trắng ở đầu hoặc cuối"
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]
              : []),
            ...(dataIndex === "password"
              ? [
                  {
                    validator: (_, value) => {
                      if (!value || value.trim().length < 4) {
                        return Promise.reject(
                          new Error("Mật khẩu phải có ít nhất 4 ký tự")
                        );
                      }
                      if (value !== value.trim()) {
                        return Promise.reject(
                          new Error(
                            "Không được có khoảng trắng ở đầu hoặc cuối"
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]
              : []),
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : dataIndex === "password" ? (
        <div>
          {visible ? record.password : "••••••"}
          <Button
            type="link"
            icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={toggleVisibility}
          />
        </div>
      ) : (
        children
      )}
    </td>
  );
};

function Admin() {
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => setIsModalOpen(true);

  const handleOk = () => {
    createForm.validateFields().then((values) => {
      handleSubmit(values);
    });
  };

  const handleHideModal = () => setIsModalOpen(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/user", values);
      setData([...data, { ...response.data.result, key: response.data.id }]);
      createForm.resetFields();
      handleHideModal();
      message.success("Tạo tài khoản thành công");
    } catch (error) {
      console.error("Failed to create account:", error);
      message.error("Tạo tài khoản thất bại.");
    } finally {
      setLoading(false);
    }
  };
  const fetchAccount = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No token found");
      }
      const config = { headers: { Authorization: `Bearer ${token}` } }; // Fixed headers typo and added space in Bearer
      const response = await axios.get("http://localhost:8080/user", config);
      setData(response.data.result.map((item) => ({ ...item, key: item.id })));
    } catch (error) {
      console.log("Failed to fetch account:", error);
      message.error("Failed to fetch account");
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const handleDeleteAccount = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/user/${id}`);
      const listAfterDelete = data.filter((account) => account.id !== id);
      setData(listAfterDelete);
      message.success("Xóa tài khoản thành công!");
    } catch (error) {
      console.error("Failed to delete account:", error);
      message.error("Xóa tài khoản thất bại.");
    }
  };

  const handleUpdateAccount = async (id, updatedData) => {
    try {
      await axios.put(`http://localhost:8080/user/${id}`, updatedData);
      const updatedDataSource = data.map((item) =>
        item.id === id ? { ...item, ...updatedData } : item
      );
      setData(updatedDataSource);
      message.success("Chỉnh sửa thành công!");
    } catch (error) {
      console.error("Failed to update account:", error);
      message.error("Chỉnh sửa thất bại.");
    }
  };

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      userName: "",
      email: "",
      password: "",
      title: "",
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => setEditingKey("");

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const userNameExists = data.some(
        (account) => account.userName === row.userName && account.key !== key
      );
      if (userNameExists) {
        message.error("Tên đăng nhập đã tồn tại");
        return;
      }

      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        const updatedData = { ...item, ...row };
        delete updatedData.key; // Loại bỏ thuộc tính key
        newData.splice(index, 1, updatedData);
        setData(newData);
        setEditingKey("");
        await handleUpdateAccount(key, updatedData);
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
      title: (
        <span className="text-2xl font-bold text-[#64748B]">Tên đăng nhập</span>
      ),
      dataIndex: "userName",
      width: "25%",
      editable: true,
    },
    {
      title: <span className="text-2xl font-bold text-[#64748B]">EMAIL</span>,
      dataIndex: "email",
      width: "25%",
      editable: true,
    },
    {
      title: (
        <span className="text-2xl font-bold text-[#64748B]">Mật khẩu</span>
      ),
      dataIndex: "password",
      width: "20%",
      editable: true,
    },
    {
      title: <span className="text-2xl font-bold text-[#64748B]">Vị trí </span>,
      dataIndex: "title",
      width: "10%",
      editable: true,
    },
    {
      dataIndex: "operation",
      width: "10%",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{ marginRight: 8 }}
            >
              Lưu
            </Typography.Link>
            <a onClick={cancel}>Hủy</a>
          </span>
        ) : (
          <Typography.Link
            disabled={editingKey !== ""}
            onClick={() => edit(record)}
          >
            Chỉnh sửa
          </Typography.Link>
        );
      },
    },
    {
      dataIndex: "id",
      key: "id",
      render: (id) => (
        <Popconfirm
          title="Xóa"
          description="Xóa tài khoản?"
          onConfirm={() => handleDeleteAccount(id)}
          okText="Có"
          cancelText="Không"
        >
          <Button danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === "age" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <>
      <div className="bg-[#353640] text-white h-40 flex justify-center items-center text-2xl">
        <h1>Welcome Admin</h1>
      </div>
      <Navbar />
      <div className="bg-[#D9D9D9] h-60 flex pt-5 justify-center">
        <Button type="primary" onClick={showModal}>
          Tạo tài khoản
        </Button>
        <Modal
          title={
            <h2 className="text-black text-center text-3xl">Tạo tài khoản</h2>
          }
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleHideModal}
          confirmLoading={loading}
        >
          <Form form={createForm} layout="vertical">
            <Form.Item
              name="userName"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: "Không được để trống" },
                {
                  validator: (_, value) => {
                    if (value !== value.trim()) {
                      return Promise.reject(
                        new Error("Không được có khoảng trắng ở đầu hoặc cuối")
                      );
                    }
                    if (data.some((account) => account.userName === value)) {
                      return Promise.reject(
                        new Error("Tên đăng nhập đã tồn tại")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="Nhập tên đăng nhập" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Không được để trống" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Không được để trống" },
                {
                  validator: (_, value) => {
                    if (!value || value.trim().length < 4) {
                      return Promise.reject(
                        new Error("Mật khẩu phải có ít nhất 4 ký tự")
                      );
                    }
                    if (value !== value.trim()) {
                      return Promise.reject(
                        new Error("Không được có khoảng trắng ở đầu hoặc cuối")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
            <Form.Item
              name="title"
              label="Vị trí"
              rules={[{ required: true, message: "Không được để trống" }]}
            >
              <Select placeholder="Chọn vị trí">
                <Option value="MANAGER">Quản lí</Option>
                <Option value="SALE_STAFF">Nhân viên bán hàng</Option>
                <Option value="DESIGN_STAFF">Nhân viên thiết kế</Option>
                <Option value="PRODUCTION_STAFF">Nhân viên gia công</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
      <div>
        <Form form={form} component={false}>
          <Table
            components={{ body: { cell: EditableCell } }}
            bordered
            dataSource={data}
            columns={mergedColumns}
            rowClassName="editable-row"
            pagination={{ onChange: cancel }}
          />
        </Form>
      </div>
    </>
  );
}

export default Admin;
