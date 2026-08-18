import { LockIcon, ShareNetworkIcon, SwapIcon } from "@/components/icons";

const PATTERNS = [
  {
    icon: LockIcon,
    name: "Singleton",
    classes: "Inventory, Owner",
    text: "There's only ever one Inventory and one Owner account in the whole app - both classes hide their own constructor and hand out the same shared instance to whoever asks for it, so nothing can accidentally spin up a second, out-of-sync copy.",
  },
  {
    icon: ShareNetworkIcon,
    name: "Observer",
    classes: "ShoppingCart -> InventoryUpdater",
    text: "Checking out doesn't reach into the Inventory directly. The ShoppingCart (a Subject) just announces which books were bought, and an InventoryUpdater (an Observer) is the one that actually deducts them - the cart doesn't need to know how the inventory works, just that something's listening.",
  },
  {
    icon: SwapIcon,
    name: "State",
    classes: "Silver, Gold extend Status",
    text: "A customer's membership tier is its own object, not just a label. Cross 1,000 points and their Status silently swaps from Silver to Gold - the customer object never needed an if-statement to know which one it currently is.",
  },
];

const RELATIONSHIPS = [
  { from: "Customer", glyph: "◆", rel: "has a", to: "Status", note: "starts Silver, flips to Gold at 1,000 pts" },
  { from: "Customer", glyph: "◆", rel: "has a", to: "ShoppingCart", note: "" },
  { from: "Owner", glyph: "○", rel: "shares", to: "Inventory", note: "same singleton instance" },
  { from: "Owner", glyph: "○", rel: "keeps a list of", to: "Customer", note: "" },
  { from: "Inventory", glyph: "○", rel: "keeps a list of", to: "Book", note: "" },
];

type ClassBoxProps = {
  name: string;
  stereotype?: string;
  fields?: string[];
  methods?: string[];
  abstractClass?: boolean;
};

function ClassBox({ name, stereotype, fields = [], methods = [], abstractClass }: ClassBoxProps) {
  return (
    <div className="w-full max-w-[220px] rounded-lg border border-line bg-card-tint backdrop-blur-[6px]">
      <div className="border-b border-line px-3 py-2 text-center">
        {stereotype && (
          <p className="font-mono text-[10px] text-ink-faint">&laquo;{stereotype}&raquo;</p>
        )}
        <p className={`text-sm font-semibold text-ink ${abstractClass ? "italic" : ""}`}>
          {name}
        </p>
      </div>
      {fields.length > 0 && (
        <div className="border-b border-line px-3 py-1.5">
          {fields.map((f) => (
            <p key={f} className="font-mono text-[11px] leading-relaxed text-ink-soft">
              {f}
            </p>
          ))}
        </div>
      )}
      {methods.length > 0 && (
        <div className="px-3 py-1.5">
          {methods.map((m) => (
            <p key={m} className="font-mono text-[11px] leading-relaxed text-ink-soft">
              {m}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function ExtendsConnector() {
  return (
    <div className="flex flex-col items-center py-1">
      <span className="text-[13px] leading-none text-ink-faint">&#9650;</span>
      <span className="h-3 w-px bg-line" />
    </div>
  );
}

/** Bookstore App's whole point was practicing design patterns for
 * COE528, so its breakdown leans into the patterns themselves as the
 * main content - structurally different from ReliaNet's architecture
 * grid, StraySAFE's flyer, and Food Hub's layer stack. Real class names,
 * fields, and methods throughout, pulled straight from the source - the
 * class diagram below is hand-built to match it, not decorative UML. */
export function BookstoreBreakdown() {
  return (
    <div className="mt-14 flex flex-col gap-14">
      <div>
        <h3 className="text-lg font-semibold text-ink">Why it exists</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Built as the culmination of COE528 - Object-Oriented Engineering
          Analysis and Design, this wasn&apos;t really about building a
          bookstore. It was about proving three classic design patterns
          could be applied correctly inside one working app, backed by
          UML class/use-case diagrams and actual black-box and
          white-box test cases.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">
          Three patterns, one app
        </h3>
        <div className="mt-6 flex flex-col gap-4">
          {PATTERNS.map((pattern) => {
            const Icon = pattern.icon;
            return (
              <div
                key={pattern.name}
                className="flex items-start gap-4 rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tag-bg text-accent-soft">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {pattern.name}
                    <span className="ml-2 font-mono text-xs font-normal text-ink-faint">
                      {pattern.classes}
                    </span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {pattern.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">Class diagram</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          The three hierarchies above, drawn out properly - hollow
          triangles for inheritance, real field and method signatures
          pulled from the source.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="flex flex-col items-center">
            <ClassBox
              name="User"
              abstractClass
              stereotype="abstract"
              fields={["# username: String", "# password: String"]}
            />
            <ExtendsConnector />
            <div className="flex w-full items-start justify-center gap-3">
              <ClassBox
                name="Customer"
                fields={["- points: int", "- status: Status", "- shoppingCart: ShoppingCart"]}
                methods={["+ setStatus(): void"]}
              />
              <ClassBox
                name="Owner"
                stereotype="Singleton"
                fields={["- customerList: List<Customer>", "- inventory: Inventory"]}
                methods={["+ getInstance(): Owner", "+ addCustomer(c)"]}
              />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <ClassBox name="Status" abstractClass stereotype="abstract" fields={["# name: String"]} />
            <ExtendsConnector />
            <div className="flex w-full items-start justify-center gap-3">
              <ClassBox name="Silver" fields={['name = "Silver"']} />
              <ClassBox name="Gold" fields={['name = "Gold"']} />
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col items-center">
            <ClassBox
              name="Subject"
              abstractClass
              stereotype="abstract"
              fields={["# observer: Observer"]}
              methods={["+ updateInv(books): void"]}
            />
            <ExtendsConnector />
            <ClassBox
              name="ShoppingCart"
              fields={["- booksInCart: List<Book>", "- totalCost: double", "- pointsOfCust: int"]}
              methods={["+ buyBooks(): void", "+ redeemAndBuyBooks(): void"]}
            />
          </div>
          <div className="flex flex-col items-center">
            <ClassBox name="Observer" abstractClass stereotype="abstract" methods={["+ updateInventory(books)"]} />
            <ExtendsConnector />
            <ClassBox name="InventoryUpdater" methods={["+ updateInventory(books)"]} />
          </div>
        </div>
        <p className="mt-3 text-center font-mono text-[11px] text-ink-faint">
          ShoppingCart <span className="text-accent-soft">- - notifies - -&gt;</span> InventoryUpdater
        </p>

        <div className="mt-6 flex flex-col gap-1.5 rounded-2xl border border-line bg-card-tint p-4 backdrop-blur-[6px]">
          {RELATIONSHIPS.map((r) => (
            <p key={`${r.from}-${r.to}`} className="font-mono text-[11px] leading-relaxed text-ink-soft">
              <span className="text-ink">{r.from}</span>{" "}
              <span className="text-ink-faint">{r.glyph} {r.rel}</span>{" "}
              <span className="text-ink">{r.to}</span>
              {r.note && <span className="text-ink-faint"> - {r.note}</span>}
            </p>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">Inside the app</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          The login screen has no real authentication behind it -{" "}
          <span className="font-mono text-ink">admin / admin</span> is
          hardcoded straight into the login button&apos;s handler and
          drops you into the Owner&apos;s screens; anything else is
          checked against the saved customer list instead.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px]">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-soft">
              As the Owner
            </p>
            <p className="mt-3 font-mono text-[12.5px] leading-loose text-ink-soft">
              Login &rarr; Owner Start Screen
              <br />
              &nbsp;&nbsp;&#9500;&#9472; Books &rarr; add / remove titles
              <br />
              &nbsp;&nbsp;&#9492;&#9472; Customers &rarr; add / delete accounts
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-card-tint p-5 backdrop-blur-[6px]">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-soft">
              As a Customer
            </p>
            <p className="mt-3 font-mono text-[12.5px] leading-loose text-ink-soft">
              Login &rarr; browse catalog
              <br />
              &nbsp;&nbsp;&#9500;&#9472; Buy &rarr; cash receipt
              <br />
              &nbsp;&nbsp;&#9492;&#9472; Redeem &rarr; points receipt
            </p>
          </div>
        </div>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
          There&apos;s no real database - every customer and book is
          round-tripped through two flat text files,{" "}
          <span className="font-mono text-ink">customers.txt</span> and{" "}
          <span className="font-mono text-ink">Books.txt</span>, re-read
          on launch and rewritten after every add, buy, or redeem.
        </p>
        <p className="mt-2 max-w-xl font-mono text-xs italic text-ink-faint">
          {"// "}the source even flags one gap itself - a stray comment
          reading &quot;THE MISSING CODE!!!!&quot; sits next to the line
          that was supposed to clear the customer list before re-reading
          it from disk
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">The rewards math</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Both checkout paths land on their own receipt screen, and the
          math on it matches ShoppingCart&apos;s formulas exactly:
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <div className="rounded-xl border border-line bg-card-tint px-4 py-3 font-mono text-sm backdrop-blur-[6px]">
            <span className="text-ink-soft">buyBooks() </span>
            <span className="text-ink-faint">-&gt; </span>
            <span className="text-accent-soft">points += 10 * totalCost</span>
          </div>
          <div className="rounded-xl border border-line bg-card-tint px-4 py-3 font-mono text-sm backdrop-blur-[6px]">
            <span className="text-ink-soft">redeemAndBuyBooks() </span>
            <span className="text-ink-faint">-&gt; </span>
            <span className="text-accent-soft">totalCost -= points / 100</span>
          </div>
        </div>
      </div>

      <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
        Built with a team of four, split across the GUI, the domain
        model, and the pattern implementations. Individual screens -
        the customer catalog view, the owner&apos;s book manager - started
        as their own standalone JavaFX apps before getting consolidated
        into one real entry point, MainBookStoreApp, the kind of
        throwaway scaffolding a class project goes through that never
        makes it into the final packaging. Every class went through a
        UML pass before it was written, and both black-box (does it
        produce the right output) and white-box (does it exercise every
        code path) test cases before it was called done.
      </p>
    </div>
  );
}
