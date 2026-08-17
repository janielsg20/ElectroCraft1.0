# COMPONENT RATIONALIZATION — ElectroCraft

Decision ladder:
Core -> prop/config -> Preset -> Block -> Binding -> Alias -> Action -> Provider -> new Core.

Layout Core:
Container, Divider, Tabs, Accordion/Disclosure, Modal, Drawer.

Container presets:
Section, Row, Column, Stack, Grid, Wrap, Scroll, Spacer, Sticky.

Content Core:
Text, RichText, Image, Gallery, Icon, Button, Link, Navigation, Video, Audio, SVG, List, Table, CodeBlock, Embed, Map, Carousel, Progress.

Presets:
Heading/Paragraph/Badge -> Text.
Breadcrumbs -> Navigation.

Dynamic:
Listing, Filter, Pagination.
Repeater -> Listing collection preset.
Dynamic values -> Binding.

Forms:
Form + FormField.
All field types aliases/config.

Administration:
DataView, Metric, Chart, Kanban, Calendar.
RecordForm reuses Form.
AdminNavigation reuses Navigation.

AI must use the same decision ladder before proposing a new component.
