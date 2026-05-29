export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <h1 className="text-4xl font-bold tracking-tight text-center sm:text-6xl">
        Intent Commerce
      </h1>
      <p className="text-lg text-muted-foreground text-center max-w-2xl">
        A conversational AI-powered multivendor marketplace. Talk to find, add to
        cart, and checkout — naturally.
      </p>
      <div className="flex gap-4 mt-4">
        <a
          href="/chat"
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition"
        >
          Start Shopping
        </a>
        <a
          href="/vendor"
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium border rounded-lg hover:bg-accent transition"
        >
          Vendor Dashboard
        </a>
      </div>
    </div>
  );
}
