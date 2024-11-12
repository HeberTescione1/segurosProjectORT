solicitudesRouter.get("/getSolicitudPdf", async (req, res) => {
    try {
        // Ruta al archivo HTML de plantilla
        const htmlTemplatePath = path.join(__dirname, "ruta/del/archivo", "archivo.html");

        // Leer el contenido de la plantilla HTML
        const htmlTemplate = fs.readFileSync(htmlTemplatePath, "utf-8");

        // Datos a insertar en la plantilla (puedes pasarlos desde req.query o req.body)
        const data = {
            fecha: req.query.fecha || "11/11/2024",
            numPoliza: req.query.numPoliza || "123456",
            aseguradora: req.query.aseguradora || "Compañía de Seguros XYZ",
            fechaOcurrencia: req.query.fechaOcurrencia || "10/11/2024",
            hora: req.query.hora || "14:00",
            nombreAsegurado: req.query.nombreAsegurado || "Juan Perez",
            domicilio: req.query.domicilio || "Calle Falsa 123",
            localidad: req.query.localidad || "Buenos Aires",
            provincia: req.query.provincia || "Buenos Aires",
            pais: req.query.pais || "Argentina",
            // Añadir más datos según sea necesario
        };

        // Compilar la plantilla con Handlebars
        const template = handlebars.compile(htmlTemplate);
        const htmlContent = template(data);

        // Usar Puppeteer para generar el PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Cargar el HTML en la página de Puppeteer
        await page.setContent(htmlContent, { waitUntil: "networkidle0" });

        // Configurar opciones de PDF
        const pdf = await page.pdf({ format: "A4", printBackground: true });
        
        // Cerrar el navegador de Puppeteer
        await browser.close();

        // Configurar la respuesta para descargar el PDF
        res.contentType("application/pdf");
        res.setHeader("Content-Disposition", "attachment;filename=solicitud.pdf");
        res.send(pdf);
    } catch (error) {
        console.error("Error al generar el PDF:", error);
        res.status(500).send("Error al generar el PDF");
    }
});