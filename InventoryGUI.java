import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.ArrayList;

public class InventoryGUI {

    static class Item {
        String name;
        int quantity;
        double price;

        Item(String name, int quantity, double price) {
            this.name = name;
            this.quantity = quantity;
            this.price = price;
        }
    }

    static ArrayList<Item> inventory = new ArrayList<>();
    static DefaultTableModel tableModel;

    public static void main(String[] args) {

        JFrame frame = new JFrame("Inventory Dashboard");
        frame.setSize(950, 520);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLayout(new BorderLayout());

        Color sidebarColor = new Color(45, 30, 70);
        Color mainBg = new Color(245, 245, 245);

        // ================= SIDEBAR =================
        JPanel sidebar = new JPanel();
        sidebar.setBackground(sidebarColor);
        sidebar.setPreferredSize(new Dimension(200, 0));
        sidebar.setLayout(new BoxLayout(sidebar, BoxLayout.Y_AXIS));
        sidebar.setBorder(BorderFactory.createEmptyBorder(15, 15, 15, 10));

        JLabel logo = new JLabel("Inventory");
        logo.setForeground(Color.WHITE);
        logo.setFont(new Font("Segoe UI", Font.BOLD, 18));
        logo.setAlignmentX(Component.LEFT_ALIGNMENT);

        JButton addBtn = createSidebarButton("Add Item");
        JButton updateBtn = createSidebarButton("Update Stock");
        JButton viewBtn = createSidebarButton("View Inventory");
        JButton reportBtn = createSidebarButton("Reports");
        JButton logoutBtn = createSidebarButton("Logout");

        sidebar.add(logo);
        sidebar.add(Box.createVerticalStrut(25));
        sidebar.add(addBtn);
        sidebar.add(Box.createVerticalStrut(10));
        sidebar.add(updateBtn);
        sidebar.add(Box.createVerticalStrut(10));
        sidebar.add(viewBtn);
        sidebar.add(Box.createVerticalStrut(10));
        sidebar.add(reportBtn);
        sidebar.add(Box.createVerticalStrut(10));
        sidebar.add(logoutBtn);

        frame.add(sidebar, BorderLayout.WEST);

        // ================= MAIN PANEL =================
        JPanel mainPanel = new JPanel(new BorderLayout());
        mainPanel.setBackground(mainBg);

        // ================= HEADER =================
        JPanel header = new JPanel() {
            protected void paintComponent(Graphics g) {
                Graphics2D g2 = (Graphics2D) g;
                GradientPaint gp = new GradientPaint(
                        0, 0, new Color(120, 80, 200),
                        getWidth(), getHeight(), new Color(80, 50, 150)
                );
                g2.setPaint(gp);
                g2.fillRect(0, 0, getWidth(), getHeight());
            }
        };
        header.setPreferredSize(new Dimension(0, 80));
        header.setLayout(new BorderLayout());

        JLabel title = new JLabel("   Inventory Dashboard");
        title.setForeground(Color.WHITE);
        title.setFont(new Font("Segoe UI", Font.BOLD, 20));

        header.add(title, BorderLayout.CENTER);
        mainPanel.add(header, BorderLayout.NORTH);

        // ================= TABLE =================
        String[] columns = {"Item", "Quantity", "Price"};
        tableModel = new DefaultTableModel(columns, 0);

        JTable table = new JTable(tableModel);
        table.setRowHeight(25);
        table.setFont(new Font("Segoe UI", Font.PLAIN, 14));

        JScrollPane scrollPane = new JScrollPane(table);
        mainPanel.add(scrollPane, BorderLayout.CENTER);

        frame.add(mainPanel, BorderLayout.CENTER);

        // ================= FUNCTIONS =================

        // ADD ITEM
        addBtn.addActionListener(e -> {
            try {
                String name = JOptionPane.showInputDialog(frame, "Item Name:");
                int qty = Integer.parseInt(JOptionPane.showInputDialog("Quantity:"));
                double price = Double.parseDouble(JOptionPane.showInputDialog("Price:"));

                inventory.add(new Item(name, qty, price));
                tableModel.addRow(new Object[]{name, qty, price});
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(frame, "Invalid input!");
            }
        });

        // UPDATE ITEM (FIXED)
        updateBtn.addActionListener(e -> {
            String name = JOptionPane.showInputDialog("Item to update:");

            for (int i = 0; i < inventory.size(); i++) {
                if (inventory.get(i).name.equalsIgnoreCase(name)) {

                    try {
                        int newQty = Integer.parseInt(JOptionPane.showInputDialog("New Quantity:"));
                        double newPrice = Double.parseDouble(JOptionPane.showInputDialog("New Price:"));

                        // Update data
                        inventory.get(i).quantity = newQty;
                        inventory.get(i).price = newPrice;

                        // Update table
                        tableModel.setValueAt(newQty, i, 1);
                        tableModel.setValueAt(newPrice, i, 2);

                        JOptionPane.showMessageDialog(frame, "Stock Updated");
                    } catch (Exception ex) {
                        JOptionPane.showMessageDialog(frame, "Invalid input!");
                    }

                    return;
                }
            }

            JOptionPane.showMessageDialog(frame, "Item not found");
        });

        // VIEW INVENTORY
        viewBtn.addActionListener(e -> {
            if (inventory.isEmpty()) {
                JOptionPane.showMessageDialog(frame, "Inventory is empty");
            } else {
                JOptionPane.showMessageDialog(frame, "Inventory loaded in table");
            }
        });

        // REPORT
        reportBtn.addActionListener(e -> {
            int totalItems = 0;
            double totalValue = 0;

            for (Item item : inventory) {
                totalItems += item.quantity;
                totalValue += item.quantity * item.price;
            }

            JOptionPane.showMessageDialog(frame,
                    "Total Items: " + totalItems +
                    "\nTotal Value: " + totalValue);
        });

        // LOGOUT
        logoutBtn.addActionListener(e -> {
            JOptionPane.showMessageDialog(frame, "Logged out");
            System.exit(0);
        });

        frame.setVisible(true);
    }

    // ================= SIDEBAR BUTTON STYLE =================
    static JButton createSidebarButton(String text) {
        JButton btn = new JButton(text);
        btn.setFocusPainted(false);
        btn.setBackground(new Color(45, 30, 70));
        btn.setForeground(Color.WHITE);
        btn.setBorder(null);
        btn.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        btn.setHorizontalAlignment(SwingConstants.LEFT);

        btn.setMaximumSize(new Dimension(Integer.MAX_VALUE, 40));
        btn.setAlignmentX(Component.LEFT_ALIGNMENT);

        return btn;
    }
}