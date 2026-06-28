import type { PageViewModel } from "@/types/cms";

export const homePage: PageViewModel = {
  slug: "home",
  title: "ThesiBook",
  seo: {
    title:
      "ThesiBook | Πλατφόρμα κρατήσεων για σεμινάρια και εκπαιδευτικές επιχειρήσεις",
    description:
      "Το ThesiBook βοηθά εκπαιδευτικές επιχειρήσεις, coaches, ακαδημίες και διοργανωτές σεμιναρίων στην Ελλάδα να δέχονται online κρατήσεις και να οργανώνουν διαθέσιμες θέσεις εύκολα.",
  },
  sections: [
    {
      type: "hero",
      badge: "Early access · Ελλάδα",
      title: "Η πιο εύκολη πλατφόρμα κρατήσεων για",
      highlightedText:
        "σεμινάρια, μαθήματα και εκπαιδευτικές επιχειρήσεις στην Ελλάδα.",
      description:
        "Με το ThesiBook, οι πελάτες βρίσκουν διαθέσιμες θέσεις, κάνουν κράτηση online και οι επιχειρήσεις οργανώνουν εύκολα τα προγράμματά τους.",
      primaryCta: {
        label: "Ζήτησε early access",
        href: "#early-access",
      },
      secondaryCta: {
        label: "Δες πώς λειτουργεί",
        href: "#how",
      },
      trustBullets: [
        { icon: "CheckCircle2", title: "Χωρίς πιστωτική κάρτα" },
        { icon: "CheckCircle2", title: "Στήσιμο σε λεπτά" },
        { icon: "CheckCircle2", title: "Στα Ελληνικά" },
      ],
      dashboardTitle: "Πίνακας ελέγχου",
      dashboardSubtitle: "Καλώς ήρθες",
      dashboardAvatarLabel: "A",
      stats: [
        { icon: "Calendar", label: "Επόμενα", value: "12" },
        { icon: "Users", label: "Κρατήσεις", value: "128" },
        { icon: "MapPin", label: "Θέσεις", value: "340" },
      ],
      featuredEvent: {
        title: "Digital Marketing Seminar",
        meta: "24 Μαΐου · 10:00 — 14:00 · Αθήνα",
        seatsLabel: "12 θέσεις",
        totalSeats: 24,
        takenIndexes: [3, 7, 11, 16],
        selectedIndex: 14,
        selectedSeatLabel: "Επιλεγμένη θέση: A5",
        priceLabel: "€49",
      },
      floatingCard: {
        icon: "CheckCircle2",
        label: "Νέα κράτηση",
        title: "Leadership Workshop",
      },
    },
    {
      type: "icon_grid",
      variant: "problem",
      eyebrow: "Το πρόβλημα",
      title: "Οι κρατήσεις δεν χρειάζεται να γίνονται δύσκολα.",
      items: [
        {
          icon: "PhoneOff",
          title: "Χαμένες κρατήσεις από μηνύματα και τηλεφωνήματα",
        },
        {
          icon: "CalendarX",
          title: "Δυσκολία στη διαχείριση διαθέσιμων θέσεων",
        },
        {
          icon: "Wallet",
          title: "Πληρωμές και συμμετοχές χωρίς οργάνωση",
        },
        {
          icon: "Search",
          title: "Πελάτες που δεν βρίσκουν εύκολα διαθέσιμα μαθήματα",
        },
      ],
    },
    {
      type: "solution",
      eyebrow: "Η λύση",
      title: "Το ThesiBook οργανώνει τις κρατήσεις σου σε",
      highlightedText: "ένα μέρος",
      description:
        "Όλη η δραστηριότητα της επιχείρησής σου — εκπαιδευτικά events, διαθέσιμες θέσεις, πελάτες, πληρωμές — σε μία απλή, σύγχρονη πλατφόρμα.",
      bullets: [
        "Δημιουργείς εκπαιδευτικά events και σεμινάρια",
        "Ορίζεις διαθέσιμες θέσεις και τιμές",
        "Διαχειρίζεσαι κρατήσεις σε ένα μέρος",
        "Δέχεσαι αιτήματα από νέους πελάτες",
        "Προωθείς τα μαθήματά σου online",
      ],
      weekdays: ["ΔΕΥ", "ΤΡΙ", "ΤΕΤ", "ΠΕΜ", "ΠΑΡ", "ΣΑΒ", "ΚΥΡ"],
      calendar: {
        totalCells: 35,
        startOffset: 2,
        monthDays: 31,
        activeDay: 22,
        availableDays: [5, 9, 14, 17, 22, 26, 29],
      },
      events: [
        {
          title: "Thesis Writing Workshop",
          schedule: "10:00 — 12:00",
          occupancy: "24/40",
        },
        {
          title: "Research Methodology",
          schedule: "13:00 — 15:00",
          occupancy: "18/30",
        },
        {
          title: "Statistical Analysis",
          schedule: "16:00 — 18:00",
          occupancy: "20/25",
        },
      ],
    },
    {
      type: "icon_grid",
      variant: "features",
      eyebrow: "Λειτουργίες",
      title: "Όλα όσα χρειάζεσαι για να γεμίσεις τις θέσεις σου.",
      items: [
        {
          icon: "CalendarCheck",
          title: "Online κρατήσεις",
          description: "Οι πελάτες κρατούν θέση 24/7 χωρίς τηλεφωνήματα.",
        },
        {
          icon: "Layers",
          title: "Διαχείριση διαθέσιμων θέσεων",
          description: "Όρισε χωρητικότητα, λίστες αναμονής και τιμές.",
        },
        {
          icon: "CalendarDays",
          title: "Ημερολόγιο σεμιναρίων",
          description: "Όλα τα μαθήματα και workshops σε ένα view.",
        },
        {
          icon: "Building2",
          title: "Προφίλ επιχείρησης",
          description: "Επαγγελματική παρουσία με branding και πληροφορίες.",
        },
        {
          icon: "FileText",
          title: "Σελίδα για κάθε σεμινάριο",
          description: "Περιγραφή, εισηγητής, φωτογραφίες και CTA.",
        },
        {
          icon: "Bell",
          title: "Notifications",
          description: "Αυτόματες υπενθυμίσεις και επιβεβαιώσεις.",
        },
        {
          icon: "Smartphone",
          title: "Mobile-friendly",
          description: "Άψογη εμπειρία σε κινητό και tablet.",
        },
        {
          icon: "Search",
          title: "Αναζήτηση χρηστών",
          description: "Φιλτράρισμα ανά περιοχή, κατηγορία και ημερομηνία.",
        },
      ],
    },
    {
      type: "for_businesses",
      eyebrow: "Για επιχειρήσεις",
      title: "Για εκπαιδευτικές επιχειρήσεις, coaches και διοργανωτές σεμιναρίων.",
      description:
        "Το ThesiBook έχει σχεδιαστεί για κάθε business που πουλάει θέσεις σε εκπαιδευτικά events.",
      businessTypes: [
        "Σεμινάρια",
        "Φροντιστήρια",
        "Ακαδημίες",
        "Workshops",
        "Yoga / Pilates studios",
        "Personal trainers",
        "Επαγγελματική κατάρτιση",
        "Ιδιωτικά μαθήματα",
        "Online courses",
      ],
      cta: {
        label: "Θέλω να μπω στην πλατφόρμα",
        href: "#early-access",
      },
    },
    {
      type: "steps",
      eyebrow: "Πώς λειτουργεί",
      title: "Από το στήσιμο μέχρι την πρώτη κράτηση, σε 3 βήματα.",
      steps: [
        {
          number: "01",
          title: "Δημιουργείς το προφίλ σου",
          description:
            "Στήσε την επιχείρησή σου σε λίγα λεπτά με logo, περιγραφή και στοιχεία επικοινωνίας.",
        },
        {
          number: "02",
          title: "Προσθέτεις μαθήματα και θέσεις",
          description:
            "Όρισε ημερομηνίες, χωρητικότητα, τιμή και πληροφορίες για κάθε σεμινάριο.",
        },
        {
          number: "03",
          title: "Οι πελάτες κάνουν κράτηση online",
          description:
            "Δέχεσαι κρατήσεις 24/7, αυτόματες επιβεβαιώσεις και υπενθυμίσεις.",
        },
      ],
    },
    {
      type: "app_preview",
      eyebrow: "App preview",
      title: "Μια εμπειρία σχεδιασμένη για κινητό.",
      description:
        "Από την ανακάλυψη του σεμιναρίου μέχρι την επιλογή θέσης — όλα σε λίγα tap.",
      discover: {
        brand: "ThesiBook",
        searchPlaceholder: "Αναζήτηση σεμιναρίων",
        categories: ["Όλα", "Business", "Yoga", "Design"],
        cards: [
          { title: "Digital Marketing", location: "Αθήνα", seats: "12 θέσεις" },
          {
            title: "Leadership Workshop",
            location: "Θεσσαλονίκη",
            seats: "8 θέσεις",
          },
        ],
      },
      details: {
        topBarLabel: "Λεπτομέρειες",
        title: "Digital Marketing Seminar",
        subtitle: "Αθήνα · 24 Μαΐου · 10:00 — 14:00",
        description: "Μάθε τις βασικές στρατηγικές του ψηφιακού μάρκετινγκ.",
        speakerLabel: "Εισηγητής",
        speakerValue: "Γιάννης Παπαδόπουλος",
        ctaLabel: "Επιλογή θέσης · €49",
      },
      seatPicker: {
        topBarLabel: "Επιλογή θέσης",
        totalSeats: 30,
        takenIndexes: [2, 9, 13, 18, 22],
        selectedIndex: 14,
        availableLabel: "Διαθ.",
        takenLabel: "Κατ.",
        selectedLabel: "Επιλ.",
        selectedSeat: "A5",
        priceLabel: "Τιμή",
        price: "€49",
        ctaLabel: "Συνέχεια",
      },
    },
    {
      type: "icon_grid",
      variant: "benefits",
      eyebrow: "Οφέλη",
      title: "Γιατί να χρησιμοποιήσεις το ThesiBook;",
      items: [
        {
          icon: "PhoneOff",
          title: "Λιγότερα τηλεφωνήματα",
          description: "Οι κρατήσεις γίνονται online, αυτόματα.",
        },
        {
          icon: "Sparkles",
          title: "Καλύτερη οργάνωση",
          description: "Κάθε event, κράτηση και πελάτης σε ένα μέρος.",
        },
        {
          icon: "TrendingUp",
          title: "Περισσότερες κρατήσεις",
          description: "Διαθεσιμότητα 24/7 σημαίνει περισσότερη ζήτηση.",
        },
        {
          icon: "Globe",
          title: "Επαγγελματική online παρουσία",
          description: "Σύγχρονη σελίδα για κάθε σεμινάριο.",
        },
        {
          icon: "Megaphone",
          title: "Εύκολη προβολή σε νέους πελάτες",
          description: "Αναζήτηση από χιλιάδες χρήστες στην Ελλάδα.",
        },
        {
          icon: "Heart",
          title: "Ιδανικό για μικρές και μεσαίες επιχειρήσεις",
          description: "Σχεδιασμένο για την ελληνική αγορά.",
        },
      ],
    },
    {
      type: "early_access",
      eyebrow: "Early access",
      title: "Θέλεις να είσαι από τους πρώτους στο ThesiBook;",
      description:
        "Συμπλήρωσε τα στοιχεία σου και θα επικοινωνήσουμε μαζί σου για early access στην πλατφόρμα.",
      benefits: [
        "Προτεραιότητα στο launch",
        "Δωρεάν onboarding",
        "Ειδικές τιμές για early adopters",
      ],
      businessTypes: [
        "Σεμινάρια",
        "Φροντιστήριο",
        "Ακαδημία",
        "Workshop",
        "Yoga / Pilates",
        "Personal trainer",
        "Επαγγελματική κατάρτιση",
        "Ιδιωτικά μαθήματα",
        "Online courses",
        "Άλλο",
      ],
      form: {
        nameLabel: "Ονοματεπώνυμο",
        namePlaceholder: "Μαρία Παπαδοπούλου",
        emailLabel: "Email",
        emailPlaceholder: "you@email.gr",
        phoneLabel: "Τηλέφωνο",
        phonePlaceholder: "69x xxx xxxx",
        companyLabel: "Όνομα επιχείρησης",
        companyPlaceholder: "π.χ. Athena Academy",
        businessTypeLabel: "Τύπος επιχείρησης",
        businessTypePlaceholder: "Επίλεξε...",
        messageLabel: "Μήνυμα",
        messagePlaceholder: "Πες μας λίγα λόγια για την επιχείρησή σου...",
      },
      submitLabel: "Ζήτησε πρόσβαση",
      successTitle: "Ευχαριστούμε!",
      successDescription:
        "Λάβαμε το αίτημά σου. Θα σε ενημερώσουμε σύντομα στο email σου.",
      errorDescription: "Προέκυψε πρόβλημα κατά την αποστολή. Δοκίμασε ξανά.",
    },
    {
      type: "faq",
      eyebrow: "FAQ",
      title: "Συχνές ερωτήσεις",
      items: [
        {
          question: "Τι είναι το ThesiBook;",
          answer:
            "Το ThesiBook είναι μια ελληνική πλατφόρμα κρατήσεων για εκπαιδευτικές επιχειρήσεις, σεμινάρια, workshops, ακαδημίες και coaches. Βοηθά τις επιχειρήσεις να δέχονται online κρατήσεις και να οργανώνουν διαθέσιμες θέσεις.",
        },
        {
          question: "Για ποιες επιχειρήσεις είναι κατάλληλο;",
          answer:
            "Για κάθε business που οργανώνει εκπαιδευτικά events: φροντιστήρια, ακαδημίες, διοργανωτές σεμιναρίων, coaches, yoga/pilates studios, personal trainers, επαγγελματική κατάρτιση, ιδιωτικά μαθήματα και online courses.",
        },
        {
          question: "Μπορώ να διαχειρίζομαι διαθέσιμες θέσεις;",
          answer:
            "Ναι. Ορίζεις χωρητικότητα ανά event, βλέπεις σε real-time πόσες θέσεις έχουν κρατηθεί και διαχειρίζεσαι λίστες αναμονής.",
        },
        {
          question: "Θα υπάρχει σελίδα για την επιχείρησή μου;",
          answer:
            "Ναι. Κάθε επιχείρηση έχει το δικό της προφίλ, καθώς και ξεχωριστή σελίδα για κάθε σεμινάριο ή μάθημα με όλες τις πληροφορίες.",
        },
        {
          question: "Είναι κατάλληλο για σεμινάρια και workshops;",
          answer:
            "Απολύτως. Το ThesiBook έχει σχεδιαστεί ειδικά για εκπαιδευτικά events όπως σεμινάρια, workshops και μαθήματα.",
        },
        {
          question: "Πότε θα είναι διαθέσιμη η πλατφόρμα;",
          answer:
            "Είμαστε σε φάση early access. Συμπλήρωσε τη φόρμα για να ενημερωθείς πρώτος και να εξασφαλίσεις προνομιακή πρόσβαση.",
        },
      ],
    },
  ],
};
