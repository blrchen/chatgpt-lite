import React, { useEffect } from 'react'
import { Form, Input, Modal } from 'antd'
import { ChatRole } from '@/components/ChatGPT/interface'
import { Persona } from '../ChatSidebar/interface'

export interface PromptModalProps {
  show?: boolean
  data?: Persona
  onSubmit?: (value: Persona) => void
  onCancel?: () => void
}

export type PersonaForm = Persona & { active?: boolean }

const PersonaModal = (props: PromptModalProps) => {
  const [form] = Form.useForm()
  const { show, data, onSubmit, onCancel } = props

  const onOk = () => {
    form.submit()
  }

  const onFinish = (values: PersonaForm) => {
    values.role = ChatRole.System
    onSubmit?.(values)
  }

  useEffect(() => {
    if (show) {
      form.setFieldsValue(data || {})
    } else {
      form.resetFields()
    }
  }, [show])

  return (
    <Modal
      title="Persona"
      open={show}
      onOk={onOk}
      onCancel={onCancel}
      forceRender
      getContainer={false}
    >
      <Form form={form} name="basic" layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input the name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Prompt" name="prompt">
          <Input.TextArea rows={8} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PersonaModal
