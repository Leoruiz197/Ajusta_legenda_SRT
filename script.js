document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('filename').value = file.name;
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('entrada').value = e.target.result;
            LeEntrada();
        };
        reader.readAsText(file);
    }
});

var texto_valido = false;
var tempo_ini;
var tempo_fim;

function LeEntrada ()
{
	var texto;
	var texto2;
	var linha;
	var pttexto = 0;
	var pos;
	var pos2;
	var iniciobloco; // marca se esta no inicio de novo bloco de legenda
	var contblocos;

	texto = document.f.entrada.value;
	texto = texto.replace (/\r/g,""); // retira caracter CR, se houver
	if (texto.charAt(texto.length - 1) != "\n") texto = texto + "\n";

	tempo_ini = 0;
	tempo_fim = 0;
	contblocos = 0;
	iniciobloco = true;
	texto2 = "";
	pos = 0;
	while (pos < texto.length) {
		for (pos2 = pos; texto.charAt(pos2) != "\n"; pos2++) ;
		linha = texto.substring (pos, pos2);
		pos = pos2 + 1;
		pos2 = linha.length - 1;
		while (pos2 >= 0 &&
		       (linha.charAt(pos2) == " " ||
		        linha.charAt(pos2) == "\t")) {
			linha = linha.substring(0, pos2);
			pos2--;
		}
		if (linha == "") {
			texto2 = texto2 + "\n";
			iniciobloco = true;
			continue;
		}
		if (iniciobloco) {
			contblocos++;
			iniciobloco = false;
			texto2 = texto2 + contblocos + "\n";
			continue;
		}
		if (linha.match (/^\d\d:\d\d:\d\d,\d\d\d --\x3e \d\d:\d\d:\d\d,\d\d\d$/) != null) {
			if (contblocos == 1) {
				document.f.iniciooriginal.value = linha.substring(0,12);
				tempo_ini = parseInt(linha.substring(0,2),10) * 3600000;
				tempo_ini += parseInt(linha.substring(3,5),10) * 60000;
				tempo_ini += parseInt(linha.substring(6,8),10) * 1000;
				tempo_ini += parseInt(linha.substring(9,12),10) * 1;
			}
			tempo_fim = parseInt(linha.substring(17,19),10) * 3600000;
			tempo_fim += parseInt(linha.substring(20,22),10) * 60000;
			tempo_fim += parseInt(linha.substring(23,25),10) * 1000;
			tempo_fim += parseInt(linha.substring(26,29),10) * 1;
			document.f.fimoriginal.value = linha.substring(17,29);
		}
		texto2 = texto2 + linha + "\n";
	}
	texto_valido = true;
	if (tempo_ini < 0 || tempo_fim <= tempo_ini || contblocos < 1) {
		texto_valido = false;
		texto2 = "Legenda inválida";
		document.f.iniciooriginal.value = "";
		document.f.fimoriginal.value = "";
	}
	document.f.saida.value = texto2;
}

function AjustaTempos ()
{
	var linha;
	var pos;
	var pos2;
	var texto;
	var texto2;
	var novo_ini;
	var novo_fim;
	var multiplicador;
	var hh;
	var mm;
	var ss;
	var mmm;
		
	if (texto_valido == false) {
		alert ("Texto inválido");
		return;	
	}
	
	linha = document.f.inicio.value;
	pos2 = linha.length - 1;
	while (pos2 >= 0 &&
	       (linha.charAt(pos2) == " " ||
	        linha.charAt(pos2) == "\t")) {
		linha = linha.substring(0, pos2);
		pos2--;
	}
	if (linha == "") {
		alert ("Tempo inicial inválido");
		return;
	}
	if (linha.match(/^\d\d:\d\d:\d\d,\d\d\d$/) != null) {
			novo_ini = parseInt(linha.substring(0,2),10) * 3600000;
			novo_ini += parseInt(linha.substring(3,5),10) * 60000;
			novo_ini += parseInt(linha.substring(6,8),10) * 1000;
			novo_ini += parseInt(linha.substring(9,12),10) * 1;
	} else if (linha.charAt(0) == "-" || linha.charAt(0) == "+") {
		if (linha.substring(1).match(/^\d+$/) == null) {
			alert ("Tempo inicial inválido");
			return;
		}
		if (linha.charAt(0) == "-")
			novo_ini = tempo_ini - parseInt(linha.substring(1),10);
		else
			novo_ini = tempo_ini + parseInt(linha.substring(1),10);
	} else {
		alert ("Tempo inicial inválido");
		return;
	}
	if (novo_ini < 0) {
		alert ("Tempo inicial inválido");
		return;
	}
	
	linha = document.f.fim.value;
	pos2 = linha.length - 1;
	while (pos2 >= 0 &&
	       (linha.charAt(pos2) == " " ||
	        linha.charAt(pos2) == "\t")) {
		linha = linha.substring(0, pos2);
		pos2--;
	}
	if (linha == "") {
		alert ("Tempo final inválido");
		return;
	}
	if (linha.match(/^\d\d:\d\d:\d\d,\d\d\d$/) != null) {
			novo_fim = parseInt(linha.substring(0,2),10) * 3600000;
			novo_fim += parseInt(linha.substring(3,5),10) * 60000;
			novo_fim += parseInt(linha.substring(6,8),10) * 1000;
			novo_fim += parseInt(linha.substring(9,12),10) * 1;
	} else if (linha.charAt(0) == "-" || linha.charAt(0) == "+") {
		if (linha.substring(1).match(/^\d+$/) == null) {
			alert ("Tempo final inválido");
			return;
		}
		if (linha.charAt(0) == "-")
			novo_fim = tempo_fim - parseInt(linha.substring(1),10);
		else
			novo_fim = tempo_fim + parseInt(linha.substring(1),10);
	} else {
		alert ("Tempo final inválido");
		return;
	}
	if (novo_fim <= novo_ini) {
		alert ("Tempo final inválido");
		return;
	}
	
	// *********** aqui comeca a arrumar o texto ********************
	
	texto = document.f.saida.value;
	texto = texto.replace (/\r/g,""); // retira caracter CR, se houver
	if (texto.charAt(texto.length - 1) != "\n") texto = texto + "\n";

	multiplicador = (novo_fim - novo_ini) / (tempo_fim - tempo_ini);
	texto2 = "";
	pos = 0;
	while (pos < texto.length) {
		for (pos2 = pos; texto.charAt(pos2) != "\n"; pos2++) ;
		linha = texto.substring (pos, pos2);
		pos = pos2 + 1;
		if (linha.match (/^\d\d:\d\d:\d\d,\d\d\d --\x3e \d\d:\d\d:\d\d,\d\d\d$/) != null) {
			tempo = parseInt(linha.substring(0,2),10) * 3600000;
			tempo += parseInt(linha.substring(3,5),10) * 60000;
			tempo += parseInt(linha.substring(6,8),10) * 1000;
			tempo += parseInt(linha.substring(9,12),10) * 1;
			tempo =  Math.round ((tempo - tempo_ini) * multiplicador + novo_ini);
			hh = Math.floor(tempo / 3600000);
			tempo -= hh * 3600000;
			hh = hh.toString(); if (hh.length == 1) hh = "0" + hh;
			mm = Math.floor(tempo / 60000);
			tempo -= mm * 60000;
			mm = mm.toString(); if (mm.length == 1) mm = "0" + mm;
			ss = Math.floor(tempo / 1000);
			tempo -= ss * 1000;
			ss = ss.toString(); if (ss.length == 1) ss = "0" + ss;
			mmm = tempo.toString();
			if (mmm.length == 2) mmm = "0" + mmm;
			if (mmm.length == 1) mmm = "00" + mmm;

			texto2 = texto2 + hh + ":" + mm + ":" + ss + "," + mmm + " --\x3e ";
			
			tempo = parseInt(linha.substring(17,19),10) * 3600000;
			tempo += parseInt(linha.substring(20,22),10) * 60000;
			tempo += parseInt(linha.substring(23,25),10) * 1000;
			tempo += parseInt(linha.substring(26,29),10) * 1;
			tempo =  Math.round ((tempo - tempo_ini) * multiplicador + novo_ini);
			hh = Math.floor(tempo / 3600000);
			tempo -= hh * 3600000;
			hh = hh.toString(); if (hh.length == 1) hh = "0" + hh;
			mm = Math.floor(tempo / 60000);
			tempo -= mm * 60000;
			mm = mm.toString(); if (mm.length == 1) mm = "0" + mm;
			ss = Math.floor(tempo / 1000);
			tempo -= ss * 1000;
			ss = ss.toString(); if (ss.length == 1) ss = "0" + ss;
			mmm = tempo.toString();
			if (mmm.length == 2) mmm = "0" + mmm;
			if (mmm.length == 1) mmm = "00" + mmm;

			texto2 = texto2 + hh + ":" + mm + ":" + ss + "," + mmm + "\n";
		} else {
			texto2 = texto2 + linha + "\n";
		}
	}
	document.f.saida.value = texto2;
	alert ("Texto ajustado!");
}

function SalvarArquivo() {
    const texto = document.getElementById('saida').value;
    const nomeArquivo = document.getElementById('filename').value.trim() || 'legenda_ajustada.srt';
    const blob = new Blob([texto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function CopiarTexto() {
    const texto = document.getElementById('saida').value;
    
    // Cria um elemento de textarea temporário fora do DOM
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = texto;
    document.body.appendChild(tempTextArea);
    
    // Seleciona todo o texto no elemento de textarea temporário
    tempTextArea.select();
    tempTextArea.setSelectionRange(0, 99999); // Para dispositivos móveis
    
    // Copia o texto selecionado
    document.execCommand('copy');
    
    // Remove o elemento de textarea temporário
    document.body.removeChild(tempTextArea);
    
    // Mostra um alerta ou outra ação de feedback para o usuário
    alert('Texto copiado para a área de transferência!');
}

