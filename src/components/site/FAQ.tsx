import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Τι είναι το ThesiBook;", a: "Το ThesiBook είναι μια ελληνική πλατφόρμα κρατήσεων για εκπαιδευτικές επιχειρήσεις, σεμινάρια, workshops, ακαδημίες και coaches. Βοηθά τις επιχειρήσεις να δέχονται online κρατήσεις και να οργανώνουν διαθέσιμες θέσεις." },
  { q: "Για ποιες επιχειρήσεις είναι κατάλληλο;", a: "Για κάθε business που οργανώνει εκπαιδευτικά events: φροντιστήρια, ακαδημίες, διοργανωτές σεμιναρίων, coaches, yoga/pilates studios, personal trainers, επαγγελματική κατάρτιση, ιδιωτικά μαθήματα και online courses." },
  { q: "Μπορώ να διαχειρίζομαι διαθέσιμες θέσεις;", a: "Ναι. Ορίζεις χωρητικότητα ανά event, βλέπεις σε real-time πόσες θέσεις έχουν κρατηθεί και διαχειρίζεσαι λίστες αναμονής." },
  { q: "Θα υπάρχει σελίδα για την επιχείρησή μου;", a: "Ναι. Κάθε επιχείρηση έχει το δικό της προφίλ, καθώς και ξεχωριστή σελίδα για κάθε σεμινάριο ή μάθημα με όλες τις πληροφορίες." },
  { q: "Είναι κατάλληλο για σεμινάρια και workshops;", a: "Απολύτως. Το ThesiBook έχει σχεδιαστεί ειδικά για εκπαιδευτικά events όπως σεμινάρια, workshops και μαθήματα." },
  { q: "Πότε θα είναι διαθέσιμη η πλατφόρμα;", a: "Είμαστε σε φάση early access. Συμπλήρωσε τη φόρμα για να ενημερωθείς πρώτος και να εξασφαλίσεις προνομιακή πρόσβαση." },
];

export function FAQ() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-soft">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Συχνές ερωτήσεις</h2>
        </div>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="border-b border-border">
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
