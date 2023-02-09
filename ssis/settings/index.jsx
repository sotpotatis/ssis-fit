// Class names are formatted as TE<year>A-D.
// Here, we make sure class names are up to date
// based on the current year.
// This code might start to fail in the year 2100.
const currentYear = parseInt(
  new Date().getFullYear().toString().substring(2, 4),
);
const earliestClassYear = currentYear - 3;
let classNameOptions = [];
for (let year = earliestClassYear; year <= currentYear; year++) {
  for (const letter of ["A", "B", "C", "D"]) {
    const className = `TE${year.toString().padStart(2)}${letter}`;
    classNameOptions.push({
      name: className,
      value: className.toLowerCase(),
    });
  }
}
console.log(
  `Generated class name options: ${JSON.stringify(classNameOptions)}`,
);

registerSettingsPage(({ settings }) => (
  <Page>
    <Section
      title={
        <Text bold align="center">
          Schemainställningar
        </Text>
      }
      description="Inställningar relaterade till inhämtningen av scheman."
    >
      <Select label="Klass" settingsKey="room" options={classNameOptions} />
    </Section>
    <Section
      title={
        <Text bold align="center">
          Övrigt
        </Text>
      }
    >
      <Text bold={true}>
        SSIS-FitBit -
        <Link source="https://20alse.ssis.nu/fitbit">
          https://20alse.ssis.nu/fitbit
        </Link>{" "}
        -<Text>Skapad med kärlek av Albin TE20A</Text> -
        <Text>
          Open source på{" "}
          <Link source="https://github.com/sotpotatis/ssis-fitbit">GitHub</Link>
          .
        </Text>
      </Text>
    </Section>
  </Page>
));
