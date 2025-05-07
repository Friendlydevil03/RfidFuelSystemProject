import { Link } from "wouter";
import { Car, CreditCard, ReceiptText, Map } from "lucide-react";

const actions = [
  {
    icon: <Car className="text-primary text-3xl mb-2" />,
    title: "My Vehicles",
    path: "/vehicles",
  },
  {
    icon: <CreditCard className="text-primary text-3xl mb-2" />,
    title: "Payment Methods",
    path: "/payment",
  },
  {
    icon: <ReceiptText className="text-primary text-3xl mb-2" />,
    title: "Transaction History",
    path: "/transactions",
  },
  {
    icon: <Map className="text-primary text-3xl mb-2" />,
    title: "Find Stations",
    path: "/stations",
  },
];

export default function QuickActions() {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Link key={index} href={action.path}>
            <a className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-md transition-shadow">
              {action.icon}
              <p className="text-center">{action.title}</p>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
