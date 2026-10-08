import { Component, Input } from '@angular/core';

import {
  TablerIconComponent,
  IconFile,
  IconFileTypeBmp,
  IconFileTypeCss,
  IconFileTypeCsv,
  IconFileTypeDoc,
  IconFileTypeDocx,
  IconFileTypeHtml,
  IconFileTypeJpg,
  IconFileTypeJs,
  IconFileTypeJsx,
  IconFileTypePdf,
  IconFileTypePhp,
  IconFileTypePng,
  IconFileTypePpt,
  IconFileTypeRs,
  IconFileTypeSql,
  IconFileTypeSvg,
  IconFileTypeTs,
  IconFileTypeTsx,
  IconFileTypeTxt,
  IconFileTypeVue,
  IconFileTypeXls,
  IconFileTypeXml,
  IconFileTypeZip,
} from '@tabler/icons-angular';

@Component({
  selector: 'app-file-type-icon',
  standalone: true,
  imports: [
    TablerIconComponent
  ],
  templateUrl: './file-type-icon.html',
  styleUrl: './file-type-icon.css',
})
export class FileTypeIcon {
  @Input() filename = '';

  iconFile = IconFile;
  iconFileTypeBmp = IconFileTypeBmp;
  iconFileTypeCss = IconFileTypeCss;
  iconFileTypeCsv = IconFileTypeCsv;
  iconFileTypeDoc = IconFileTypeDoc;
  iconFileTypeDocx = IconFileTypeDocx;
  iconFileTypeHtml = IconFileTypeHtml;
  iconFileTypeJpg = IconFileTypeJpg;
  iconFileTypeJs = IconFileTypeJs;
  iconFileTypeJsx = IconFileTypeJsx;
  iconFileTypePdf = IconFileTypePdf;
  iconFileTypePhp = IconFileTypePhp;
  iconFileTypePng = IconFileTypePng;
  iconFileTypePpt = IconFileTypePpt;
  iconFileTypeRs = IconFileTypeRs;
  iconFileTypeSql = IconFileTypeSql;
  iconFileTypeSvg = IconFileTypeSvg;
  iconFileTypeTs = IconFileTypeTs;
  iconFileTypeTsx = IconFileTypeTsx;
  iconFileTypeTxt = IconFileTypeTxt;
  iconFileTypeVue = IconFileTypeVue;
  iconFileTypeXls = IconFileTypeXls;
  iconFileTypeXml = IconFileTypeXml;
  iconFileTypeZip = IconFileTypeZip;

  get fileType(): string {
    const extension = this.filename
      .split('.')
      .pop()
      ?.toLowerCase();

    switch (extension) {
      case 'bmp': return 'bmp';
      case 'css': return 'css';
      case 'csv': return 'csv';
      case 'doc': return 'doc';
      case 'docx': return 'docx';

      case 'html':
      case 'htm':
        return 'html';

      case 'jpg':
      case 'jpeg':
        return 'jpg';

      case 'js': return 'js';
      case 'jsx': return 'jsx';
      case 'pdf': return 'pdf';
      case 'php': return 'php';
      case 'png': return 'png';

      case 'ppt':
      case 'pptx':
        return 'ppt';

      case 'rs': return 'rs';
      case 'sql': return 'sql';
      case 'svg': return 'svg';
      case 'ts': return 'ts';
      case 'tsx': return 'tsx';

      case 'txt':
      case 'md':
        return 'txt';

      case 'vue': return 'vue';

      case 'xls':
      case 'xlsx':
        return 'xls';

      case 'xml': return 'xml';

      case 'zip':
      case '7z':
      case 'rar':
      case 'tar':
      case 'gz':
        return 'zip';

      default:
        return 'generic';
    }
  }
}