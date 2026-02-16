import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table } from './Table';

interface TestItem {
  id: string;
  name: string;
  email: string;
}

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
];

const data: TestItem[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

describe('Table', () => {
  it('renders column headers', () => {
    render(<Table columns={columns} data={data} keyExtractor={(item) => item.id} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<Table columns={columns} data={data} keyExtractor={(item) => item.id} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('shows empty message when data is empty', () => {
    render(<Table columns={columns} data={[]} keyExtractor={(item: TestItem) => item.id} />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('shows custom empty message', () => {
    render(
      <Table
        columns={columns}
        data={[]}
        keyExtractor={(item: TestItem) => item.id}
        emptyMessage="No members found"
      />
    );

    expect(screen.getByText('No members found')).toBeInTheDocument();
  });

  it('renders custom cell content with render function', () => {
    const columnsWithRender = [
      { key: 'name', header: 'Name' },
      {
        key: 'email',
        header: 'Email',
        render: (item: TestItem) => <a href={`mailto:${item.email}`}>{item.email}</a>,
      },
    ];

    render(<Table columns={columnsWithRender} data={data} keyExtractor={(item) => item.id} />);

    const link = screen.getByRole('link', { name: 'john@example.com' });
    expect(link).toHaveAttribute('href', 'mailto:john@example.com');
  });

  it('calls onRowClick when row is clicked', async () => {
    const handleRowClick = vi.fn();
    render(
      <Table columns={columns} data={data} keyExtractor={(item) => item.id} onRowClick={handleRowClick} />
    );

    await userEvent.click(screen.getByText('John Doe'));

    expect(handleRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('makes rows focusable when onRowClick is provided', () => {
    const handleRowClick = vi.fn();
    render(
      <Table columns={columns} data={data} keyExtractor={(item) => item.id} onRowClick={handleRowClick} />
    );

    const rows = screen.getAllByRole('button');
    expect(rows).toHaveLength(2);
    rows.forEach((row) => {
      expect(row).toHaveAttribute('tabindex', '0');
    });
  });

  it('calls onRowClick when Enter is pressed on row', async () => {
    const handleRowClick = vi.fn();
    render(
      <Table columns={columns} data={data} keyExtractor={(item) => item.id} onRowClick={handleRowClick} />
    );

    const row = screen.getAllByRole('button')[0];
    row.focus();
    await userEvent.keyboard('{Enter}');

    expect(handleRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('calls onRowClick when Space is pressed on row', async () => {
    const handleRowClick = vi.fn();
    render(
      <Table columns={columns} data={data} keyExtractor={(item) => item.id} onRowClick={handleRowClick} />
    );

    const row = screen.getAllByRole('button')[0];
    row.focus();
    await userEvent.keyboard(' ');

    expect(handleRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('does not make rows focusable when onRowClick is not provided', () => {
    render(<Table columns={columns} data={data} keyExtractor={(item) => item.id} />);

    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });
});
