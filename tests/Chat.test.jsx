import { h } from 'preact';
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import Chat from '../../src/components/Chat';

describe('Chat component', () => {
	it('renders username and input box', () => {
		render(<Chat host="ws://example.com" username="tester" />);
		expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
		expect(screen.getByText(/tester/)).toBeInTheDocument();
	});

	it('sends a message when form is submitted', async () => {
		const fakeSocket = {
			send: jest.fn(),
			addEventListener: jest.fn(),
			close: jest.fn(),
			readyState: 1 // OPEN
		};
		global.WebSocket = jest.fn(() => fakeSocket);

		render(<Chat host="ws://example.com" username="tester" />);
		const input = screen.getByPlaceholderText(/type a message/i);
		fireEvent.input(input, { target: { value: 'hello' } });
		fireEvent.submit(input.closest('form'));

		await waitFor(() => {
			expect(fakeSocket.send).toHaveBeenCalledWith(
				JSON.stringify({ user: 'tester', message: 'hello', room: 'default' })
			);
		});
	});
});
