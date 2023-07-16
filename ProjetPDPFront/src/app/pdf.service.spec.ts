import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { PdfService } from './pdf.service';
import { of } from 'rxjs';

describe('PdfService', () => {
  let service: PdfService;
  let messageService: MessageService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PdfService, MessageService]
    });
    // Obtenir les instances des services à tester
    service = TestBed.inject(PdfService);
    messageService = TestBed.inject(MessageService);
    // Obtenir l'instance du contrôleur de test HTTP
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Vérifier qu'il n'y a pas de requêtes HTTP en attente ou non résolues
    httpTestingController.verify();
  });

  it('should be created', () => {
    // Vérifier que le service est créé avec succès
    expect(service).toBeTruthy();
  });

  it('should extract all values from an object', () => {
    // Test de la méthode extractAllValues()
    const obj = {
      prop1: 'value1',
      prop2: {
        nestedProp1: 'nestedValue1',
        nestedProp2: 'nestedValue2'
      },
      prop3: 'value3'
    };

    const expectedValues = ['value1', 'nestedValue1', 'nestedValue2', 'value3'];

    // Appeler la méthode extractAllValues() du service
    const extractedValues = service.extractAllValues(obj);

    // Vérifier que les valeurs extraites sont correctes
    expect(extractedValues).toEqual(expectedValues);
  });

  it('should get user data by SIRET', () => {
    // Test de la méthode getUserData()
    const siret = '1234567890';
    const expectedData = { name: 'John Doe' };

    // Appeler la méthode getUserData() du service
    service.getUserData(siret).subscribe((data) => {
      // Vérifier que les données reçues sont correctes
      expect(data).toEqual(expectedData);
    });

    // Intercepter la requête HTTP correspondante
    const req = httpTestingController.expectOne(`http://localhost:3000/api/users/${siret}`);
    expect(req.request.method).toEqual('GET');

    // Répondre à la requête avec les données attendues
    req.flush(expectedData);
  });

  it('should get logged-in user data', () => {
    // Test de la méthode getLoggedInUserData()
    const expectedData = { name: 'John Doe' };

    // Appeler la méthode getLoggedInUserData() du service
    service.getLoggedInUserData().subscribe((data) => {
      // Vérifier que les données reçues sont correctes
      expect(data).toEqual(expectedData);
    });

    // Intercepter la requête HTTP correspondante
    const req = httpTestingController.expectOne('http://localhost:3000/api/user');
    expect(req.request.method).toEqual('GET');

    // Répondre à la requête avec les données attendues
    req.flush(expectedData);
  });

  it('should extract XML from PDF', (done) => {
    // Test de la méthode extractXmlFromPdf()
    const pdfData = new ArrayBuffer(10); // Données PDF fictives
    const expectedXmlData = { prop1: 'value1', prop2: 'value2' };

    // Appeler la méthode extractXmlFromPdf() du service
    service.extractXmlFromPdf(pdfData).then((jsonData) => {
      // Vérifier que les données XML extraites sont correctes
      expect(jsonData).toEqual(expectedXmlData);
      done();
    });

    // Intercepter la requête HTTP correspondante
    const req = httpTestingController.expectOne({ url: 'pdf.worker.js' });
    expect(req.request.method).toEqual('GET');

    // Répondre à la requête avec le fichier worker PDF fictif
    req.flush('');

    // Intercepter la requête HTTP correspondante
    const attachmentsReq = httpTestingController.expectOne('attachments');
    expect(attachmentsReq.request.method).toEqual('GET');

    // Répondre à la requête avec les données XML attendues
    attachmentsReq.flush(expectedXmlData);
  });

  it('should verify PDF with XML attachment', (done) => {
    // Test de la méthode verifyPdf()
    const pdfData = new ArrayBuffer(10); // Données PDF fictives

    // Appeler la méthode verifyPdf() du service
    service.verifyPdf(pdfData).then((isValid) => {
      // Vérifier que la vérification du PDF est valide
      expect(isValid).toBeTrue();
      done();
    });

    // Intercepter la requête HTTP correspondante
    const req = httpTestingController.expectOne({ url: 'pdf.worker.js' });
    expect(req.request.method).toEqual('GET');

    // Répondre à la requête avec le fichier worker PDF fictif
    req.flush('');

    // Intercepter la requête HTTP correspondante
    const attachmentsReq = httpTestingController.expectOne('attachments');
    expect(attachmentsReq.request.method).toEqual('GET');

    // Répondre à la requête avec une pièce jointe XML fictive
    attachmentsReq.flush({ 'attachment.xml': 'XML content' });
  });

  it('should verify PDF without XML attachment', (done) => {
    // Test de la méthode verifyPdf()
    const pdfData = new ArrayBuffer(10); // Données PDF fictives

    // Appeler la méthode verifyPdf() du service
    service.verifyPdf(pdfData).then((isValid) => {
      // Vérifier que la vérification du PDF n'est pas valide
      expect(isValid).toBeFalse();
      done();
    });

    // Intercepter la requête HTTP correspondante
    const req = httpTestingController.expectOne({ url: 'pdf.worker.js' });
    expect(req.request.method).toEqual('GET');

    // Répondre à la requête avec le fichier worker PDF fictif
    req.flush('');

    // Intercepter la requête HTTP correspondante
    const attachmentsReq = httpTestingController.expectOne('attachments');
    expect(attachmentsReq.request.method).toEqual('GET');

    // Répondre à la requête sans pièce jointe XML
    attachmentsReq.flush({});
  });

  it('should read JSON file', (done) => {
    // Test de la méthode readFile() pour les fichiers JSON
    const file = new File(['{"prop": "value"}'], 'test.json', { type: 'application/json' });
    const expectedData = { prop: 'value' };

    // Appeler la méthode readFile() du service
    service.readFile(file).then((data) => {
      // Vérifier que les données lues sont correctes
      expect(data).toEqual(expectedData);
      done();
    });
  });

  it('should read XML file', (done) => {
    // Test de la méthode readFile() pour les fichiers XML
    const file = new File(['<root><prop>value</prop></root>'], 'test.xml', { type: 'text/xml' });
    const expectedData = { root: { prop: 'value' } };

    // Appeler la méthode readFile() du service
    service.readFile(file).then((data) => {
      // Vérifier que les données lues sont correctes
      expect(data).toEqual(expectedData);
      done();
    });
  });

  it('should read PDF file and extract XML', (done) => {
    // Test de la méthode readFile() pour les fichiers PDF avec extraction XML
    const pdfData = new ArrayBuffer(10); // Données PDF fictives
    const file = new File([pdfData], 'test.pdf', { type: 'application/pdf' });
    const expectedXmlData = { prop1: 'value1', prop2: 'value2' };

    spyOn(service, 'extractXmlFromPdf').and.returnValue(Promise.resolve(expectedXmlData));

    // Appeler la méthode readFile() du service
    service.readFile(file).then((data) => {
      // Vérifier que les données XML extraites sont correctes
      expect(data).toEqual(expectedXmlData);
      done();
    });
  });

  it('should handle unsupported file types', (done) => {
    // Test de la méthode readFile() pour les types de fichiers non pris en charge
    const file = new File(['file content'], 'test.txt', { type: 'text/plain' });

    // Appeler la méthode readFile() du service
    service.readFile(file).catch((error) => {
      // Vérifier que l'erreur indique un type de fichier non pris en charge
      expect(error).toContain('Unsupported file type');
      done();
    });
  });

  it('should handle file reading errors', (done) => {
    // Test de la méthode readFile() pour les erreurs de lecture de fichier
    const file = new File(['file content'], 'test.txt', { type: 'text/plain' });

    spyOn(window, 'FileReader').and.returnValue({
      readAsArrayBuffer: () => {
        // Émuler une erreur de lecture de fichier
        const event = new Event('error');
        (window.FileReader as any).onerror(event);
      }
    });

    // Appeler la méthode readFile() du service
    service.readFile(file).catch((error) => {
      // Vérifier que l'erreur indique une erreur de lecture de fichier
      expect(error).toContain('Error reading file');
      done();
    });
  });

  it('should handle error extracting XML from PDF', (done) => {
    // Test de la méthode readFile() pour les erreurs d'extraction XML à partir d'un fichier PDF
    const pdfData = new ArrayBuffer(10); // Données PDF fictives
    const file = new File([pdfData], 'test.pdf', { type: 'application/pdf' });

    spyOn(service, 'extractXmlFromPdf').and.returnValue(Promise.resolve(null));

    // Appeler la méthode readFile() du service
    service.readFile(file).catch((error) => {
      // Vérifier que l'erreur indique qu'aucune donnée XML n'a été trouvée dans le PDF
      expect(error).toContain('No XML data found in PDF');
      done();
    });
  });

});
