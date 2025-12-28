import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Chatbot } from '../Chatbot'

describe('Chatbot', () => {
  const mockOnToggle = jest.fn()

  beforeEach(() => {
    mockOnToggle.mockClear()
  })

  it('renders toggle button when closed', () => {
    render(<Chatbot isOpen={false} onToggle={mockOnToggle} />)
    
    const toggleButton = screen.getByLabelText('Open chatbot')
    expect(toggleButton).toBeInTheDocument()
  })

  it('renders chat interface when open', () => {
    render(<Chatbot isOpen={true} onToggle={mockOnToggle} />)
    
    expect(screen.getByText('Wishlist Assistant')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    expect(screen.getByText(/Hi! I'm your wishlist assistant/)).toBeInTheDocument()
  })

  it('calls onToggle when toggle button is clicked', () => {
    render(<Chatbot isOpen={false} onToggle={mockOnToggle} />)
    
    const toggleButton = screen.getByLabelText('Open chatbot')
    fireEvent.click(toggleButton)
    
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('sends message and receives response', async () => {
    render(<Chatbot isOpen={true} onToggle={mockOnToggle} />)
    
    const input = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getByRole('button', { name: '' }) // Send button with SVG
    
    fireEvent.change(input, { target: { value: 'hello' } })
    fireEvent.click(sendButton)
    
    expect(screen.getByText('hello')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText(/Hello! How can I assist you/)).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('sends message on Enter key press', async () => {
    render(<Chatbot isOpen={true} onToggle={mockOnToggle} />)
    
    const input = screen.getByPlaceholderText('Type your message...')
    
    fireEvent.change(input, { target: { value: 'help' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    expect(screen.getByText('help')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText(/I can help you with your wishlist/)).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('disables send button when input is empty', () => {
    render(<Chatbot isOpen={true} onToggle={mockOnToggle} />)
    
    const input = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getByRole('button', { name: '' })
    
    expect(sendButton).toBeDisabled()
    
    fireEvent.change(input, { target: { value: 'test' } })
    expect(sendButton).not.toBeDisabled()
    
    fireEvent.change(input, { target: { value: '' } })
    expect(sendButton).toBeDisabled()
  })
})