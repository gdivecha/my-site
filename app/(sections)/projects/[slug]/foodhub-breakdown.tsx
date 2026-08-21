import {
  ChevronDownIcon,
  CloudIcon,
  CodeBracketsIcon,
  DatabaseIcon,
  FileIcon,
  SlidersIcon,
} from "@/components/icons";

const LAYERS = [
  {
    icon: CodeBracketsIcon,
    name: "GUI",
    tech: "HTML / JSP",
    items: ["login.html", "catalog.jsp", "shoppingCart.jsp", "createFoodItem.html"],
  },
  {
    icon: SlidersIcon,
    name: "Business",
    tech: "Servlets",
    items: ["LoginServlet", "AddItemToCartServlet", "CreateFoodItemServlet", "ViewUsersServlet"],
  },
  {
    icon: FileIcon,
    name: "Assistance",
    tech: "DTOs",
    items: ["CustomerInfo", "EmployeeInfo", "FoodItemInfo", "ShoppingCartInfo"],
  },
  {
    icon: DatabaseIcon,
    name: "Persistence",
    tech: "CRUD classes",
    items: ["CustomerCRUD", "EmployeeCRUD", "FoodItemCRUD", "ShoppingCartCRUD"],
  },
];

const CUSTOMER_CAN = [
  "Browse the catalog of available food items",
  "Add items to a shopping cart",
  "Check out - available stock is deducted automatically",
];

const EMPLOYEE_CAN = [
  "Create, update, or delete food items in the catalog",
  "Create, update, or delete customer and employee accounts",
  "View the full customer list and current inventory",
];

const ENTITIES = [
  { name: "Customer", pk: "CustomerID", fields: ["FirstName", "LastName", "Username (unique)"] },
  { name: "Employee", pk: "EmployeeID", fields: ["FirstName", "LastName", "Username (unique)"] },
  { name: "FoodItem", pk: "FoodItemID", fields: ["ItemName (unique)", "Category", "Price", "AvailableStock"] },
  { name: "ShoppingCart", pk: "CustomerID + FoodItemID", fields: ["Quantity", "TotalPrice"] },
];

/** Food Hub is a textbook layered enterprise app (GUI, Business,
 * Assistance, Persistence, then MySQL), so its breakdown leans into
 * that directly - a literal stacked diagram of the request's path
 * through the system, rather than ReliaNet's architecture grid or
 * StraySAFE's flyer-and-tracks. Real class/servlet names throughout,
 * pulled from the actual project report and source tree. */
export function FoodHubBreakdown() {
  return (
    <div className="mt-14 flex flex-col gap-14">
      <div>
        <h3 className="text-lg font-semibold text-ink">Why it exists</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Food Hub behaves like an online grocery-pickup service: a
          customer orders food without ever walking a store aisle, while
          staff manage what&apos;s in stock and who has an account -
          the same split most real ordering platforms are built around.
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
          It was also a deliberate exercise for COE692 in a specific
          engineering discipline: a strict layered architecture where
          each tier only ever talks to the one directly beneath it - the
          GUI never touches the database, the database never renders a
          page. That constraint is the whole point of the stack below.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          A request&apos;s path through the stack
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Four layers, each only talking to the one directly below it -
          a classic enterprise-Java shape, built to keep the web pages,
          the request handling, the data objects, and the database each
          in their own lane.
        </p>

        <div className="mt-6 flex flex-col items-stretch">
          {LAYERS.map((layer, i) => {
            const Icon = layer.icon;
            return (
              <div key={layer.name} className="flex flex-col items-center">
                <div className="w-full rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px] sm:p-5">
                  {/* order-2/justify-end/text-right (mobile only) —
                      icon on the right of the label, matching the
                      site's usual mobile right-anchored-icon
                      convention. Desktop keeps the original icon-left
                      order. */}
                  <div className="flex items-center justify-end gap-3 text-right md:justify-start md:text-left">
                    <span className="order-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tag-bg text-accent-soft md:order-none">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-semibold text-ink">
                      {layer.name}
                      <span className="ml-2 text-xs font-normal text-ink-faint">
                        {layer.tech}
                      </span>
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap justify-end gap-1.5 pl-12 md:justify-start">
                    {layer.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-md bg-tag-bg px-2 py-1 font-mono text-[11px] text-ink-soft"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                {i < LAYERS.length - 1 && (
                  <ChevronDownIcon
                    className="my-1.5 h-4 w-4 shrink-0 text-ink-faint"
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}

          <div className="flex justify-center">
            <ChevronDownIcon
              className="my-1.5 h-4 w-4 shrink-0 text-ink-faint"
              aria-hidden="true"
            />
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px] sm:p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tag-bg text-accent-soft">
              <CloudIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-ink">
              MySQL
              <span className="ml-2 text-xs font-normal text-ink-faint">
                4 tables: Customer, Employee, FoodItem, ShoppingCart
              </span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">Two roles, one system</h3>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px]">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-soft">
              A customer can
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {CUSTOMER_CAN.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-ink-soft">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px]">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-soft">
              An employee can
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {EMPLOYEE_CAN.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-ink-soft">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">The data model</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Four tables, designed as an ER model before a line of SQL was
          written. Customer and Employee share the same login shape;
          ShoppingCart is really an order line, referencing a Customer and
          a FoodItem together.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ENTITIES.map((entity) => (
            <div
              key={entity.name}
              className="rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]"
            >
              <p className="font-mono text-sm font-semibold text-ink">
                {entity.name}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-ink-faint">
                PK: {entity.pk}
              </p>
              <div className="mt-2 flex flex-wrap justify-end gap-1.5 md:justify-start">
                {entity.fields.map((field) => (
                  <span
                    key={field}
                    className="rounded-md bg-tag-bg px-2 py-1 font-mono text-[11px] text-ink-soft"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
        Built with a partner for COE692, split across the four layers
        above so each person could own a piece of the stack. Two small
        rules do a lot of the real work: placing an order deducts the
        quantity ordered from that item&apos;s available stock, and each
        cart line&apos;s total price is computed as price times quantity
        rather than stored redundantly.
      </p>
    </div>
  );
}
