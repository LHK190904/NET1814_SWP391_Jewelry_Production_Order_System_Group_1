import React, { useState } from "react";
import Carousel from "../../components/Carousel";
import { Input, Modal, Form } from "antd";
import { useForm } from "antd/es/form/Form";
import authService from "../../services/authService";
import axios from "axios";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();

  const handleShowModal = () => {
    setIsModalOpen(true);
  };

  const handleHideModal = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      form.resetFields();
      const user = authService.getCurrentUser();
      if (user && user.id) {
        const API_URL = `http://localhost:8080/requests/${user.id}`;
        axios
          .post(API_URL, values, {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          })
          .then((response) => {
            console.log("Success", response.data);
            setIsModalOpen(false);
          })
          .catch((error) => {
            console.error("Error", error);
          });
      }
    });
  };

  return (
    <div>
      <div className="w-full h-fit">
        <Carousel />
      </div>
      <div className="flex items-center justify-center min-h-screen bg-[#434343]">
        <div>
          <button onClick={handleShowModal} className="text-white">
            ĐẶT YÊU CẦU
          </button>
        </div>
      </div>
      <Modal
        title="YÊU CẦU TƯ VẤN GIA CÔNG"
        visible={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
          initialValues={{
            modifier: "public",
          }}
        >
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              {
                required: true,
                message: "Hãy nhập mô tả",
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}